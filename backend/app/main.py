"""ITM Gwalior FastAPI application."""
from __future__ import annotations

import asyncio
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Force UTF-8 for stdout/stderr (fixes UnicodeEncodeError on Windows with emoji/logging)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.logging import RequestContextMiddleware, configure_logging, log
from app.core.ratelimit import limiter
from app.ai_agent.database import vector_db
from app.ai_agent.agent import assistant
from app.routers import admissions as admissions_router
from app.routers import audit as audit_router
from app.routers import auth as auth_router
from app.routers import clubs as clubs_router
from app.routers import compliance as compliance_router
from app.routers import departments as departments_router
from app.routers import health as health_router
from app.routers import media as media_router
from app.routers import pages as pages_router
from app.routers import placements as placements_router
from app.routers import public as public_router
from app.routers import research as research_router
from app.routers import seo as seo_router
from app.routers import settings as settings_router
from app.routers import users as users_router

# AI Agent
from app.ai_agent.routers import chat as ai_chat_router
from app.ai_agent.routers import data as ai_data_router
from app.ai_agent.routers import manage as ai_manage_router


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    log.info(
        "app.starting",
        env=settings.ENV,
        db=settings.DATABASE_URL.split("@")[-1],
        storage=settings.STORAGE_BACKEND,
    )
    Path(settings.UPLOAD_DIR).mkdir(parents=True, exist_ok=True)

    # Initialize AI Agent services (ChromaDB + NVIDIA LLM)
    try:
        await vector_db.initialize()
        doc_count = vector_db.count_documents()
        log.info("ai_agent.chroma_ready", documents=doc_count)

        # Auto-index website content in the background if the vector store is empty
        if doc_count == 0:
            log.info("ai_agent.auto_index_starting", message="Vector store empty, starting background website indexing...")

            async def _auto_index():
                """Background task: crawl websites and index into ChromaDB."""
                try:
                    from app.ai_agent.config import settings as ai_settings
                    from app.ai_agent.scrapers.website_crawler import WebsiteCrawler

                    urls_to_index = [
                        ai_settings.PRIMARY_WEBSITE,
                        ai_settings.LEGACY_WEBSITE,
                    ]

                    total_chunks = 0
                    for url in urls_to_index:
                        if not url:
                            continue
                        try:
                            crawler = WebsiteCrawler(url, max_pages=30)
                            results = await crawler.scrape()
                            await crawler.close()
                            if results:
                                texts = [r["text"] for r in results]
                                metadatas = [r["metadata"] for r in results]
                                added = await asyncio.to_thread(
                                    vector_db.add_documents, texts, metadatas
                                )
                                total_chunks += added
                                log.info("ai_agent.indexed_website", url=url, chunks=added)
                        except Exception as e:
                            log.warning("ai_agent.index_failed", url=url, error=str(e))

                    log.info("ai_agent.auto_index_complete", total_chunks=total_chunks)
                except Exception as e:
                    log.warning("ai_agent.auto_index_error", error=str(e))

            # Fire-and-forget background task — server starts immediately
            task = asyncio.create_task(_auto_index())
            # Store reference on the app to prevent garbage collection
            _._auto_index_task = task

    except Exception as e:
        log.warning("ai_agent.chroma_init_failed", error=str(e))

    try:
        await assistant.initialize()
        log.info("ai_agent.assistant_ready")
    except Exception as e:
        log.warning("ai_agent.assistant_init_failed", error=str(e))

    yield
    log.info("app.stopping")


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan,
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds OWASP-recommended response headers. CSP intentionally permissive on
    /uploads/* media. Tighten in nginx for HTTP/2 / HSTS in production."""

    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
        response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
        if settings.ENV == "production":
            response.headers.setdefault(
                "Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload"
            )
        return response


app.state.limiter = limiter
app.add_middleware(GZipMiddleware, minimum_size=512)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(RequestContextMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.frontend_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-Id"],
)


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(request, exc):
    from fastapi.responses import JSONResponse

    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": "RATE_LIMITED",
                "message": "Too many requests. Please slow down.",
                "fields": {},
            }
        },
    )


register_exception_handlers(app)

app.include_router(health_router.router, prefix=settings.API_PREFIX)
app.include_router(auth_router.router, prefix=settings.API_PREFIX)
app.include_router(users_router.router, prefix=settings.API_PREFIX)
app.include_router(users_router.catalog_router, prefix=settings.API_PREFIX)
app.include_router(audit_router.router, prefix=settings.API_PREFIX)
app.include_router(media_router.router, prefix=settings.API_PREFIX)
app.include_router(settings_router.router, prefix=settings.API_PREFIX)
app.include_router(pages_router.router, prefix=settings.API_PREFIX)
app.include_router(departments_router.router, prefix=settings.API_PREFIX)
app.include_router(placements_router.router, prefix=settings.API_PREFIX)
app.include_router(research_router.router, prefix=settings.API_PREFIX)
app.include_router(clubs_router.router, prefix=settings.API_PREFIX)
app.include_router(admissions_router.router, prefix=settings.API_PREFIX)
app.include_router(compliance_router.router, prefix=settings.API_PREFIX)
app.include_router(public_router.router, prefix=settings.API_PREFIX)
app.include_router(seo_router.router, prefix=settings.API_PREFIX)

# AI Agent endpoints
app.include_router(ai_chat_router.router, prefix=settings.API_PREFIX + "/ai")
app.include_router(ai_data_router.router, prefix=settings.API_PREFIX + "/ai")
app.include_router(ai_manage_router.router, prefix=settings.API_PREFIX + "/ai")

# Serve uploaded media in development; nginx handles this in production.
if settings.STORAGE_BACKEND == "local":
    upload_path = Path(settings.UPLOAD_DIR).resolve()
    upload_path.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=str(upload_path)), name="uploads")


@app.get("/")
def index():
    return {
        "name": settings.APP_NAME,
        "version": "0.1.0",
        "docs": f"{settings.API_PREFIX}/docs",
    }
