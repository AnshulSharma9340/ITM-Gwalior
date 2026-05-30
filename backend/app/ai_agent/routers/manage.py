"""Management endpoints for scraping, indexing, and health monitoring."""
from __future__ import annotations

import asyncio
import logging
from typing import Any

from fastapi import APIRouter, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from app.ai_agent.agent import assistant
from app.ai_agent.config import settings
from app.ai_agent.database import vector_db
from app.ai_agent.models import ScrapeRequest, ScrapeResponse, UploadPDFResponse

logger = logging.getLogger("ai-agent.manage-router")
router = APIRouter(prefix="/manage", tags=["management"])


@router.get("/health")
async def health_check():
    """Health check endpoint for the AI Agent service."""
    chroma_ok = vector_db.is_initialized
    nvidia_ok = assistant.is_initialized

    doc_count = await asyncio.to_thread(vector_db.count_documents) if chroma_ok else 0

    return {
        "status": "ok" if (chroma_ok and nvidia_ok) else "degraded",
        "version": "1.0.0",
        "model": settings.NVIDIA_MODEL,
        "chroma_connected": chroma_ok,
        "nvidia_connected": nvidia_ok,
        "documents_indexed": doc_count,
        "environment": settings.ENV,
    }


@router.post("/scrape", response_model=ScrapeResponse)
async def scrape_website(request: ScrapeRequest):
    """Scrape a website or specific pages and index the content."""
    try:
        url = request.url
        scrape_type = request.scrape_type

        if scrape_type == "auto":
            from app.ai_agent.scrapers.website_crawler import WebsiteCrawler
            crawler = WebsiteCrawler(url, max_pages=settings.MAX_SCRAPE_PAGES)
        else:
            scraper_map = {
                "faculty": ("app.ai_agent.scrapers.faculty", "FacultyScraper"),
                "admissions": ("app.ai_agent.scrapers.admissions", "AdmissionsScraper"),
                "departments": ("app.ai_agent.scrapers.website_crawler", "WebsiteCrawler"),
                "placements": ("app.ai_agent.scrapers.placements", "PlacementsScraper"),
                "notices": ("app.ai_agent.scrapers.notices", "NoticesScraper"),
                "events": ("app.ai_agent.scrapers.events", "EventsScraper"),
                "pdf": ("app.ai_agent.scrapers.pdf_ingestor", "PDFIngestor"),
            }

            module_path, class_name = scraper_map.get(scrape_type, ("app.ai_agent.scrapers.website_crawler", "WebsiteCrawler"))
            import importlib
            module = importlib.import_module(module_path)
            scraper_class = getattr(module, class_name)
            crawler = scraper_class(url)

        try:
            results = await crawler.scrape()
        finally:
            await crawler.close()

        if not results:
            return ScrapeResponse(
                status="error",
                message=f"No content found at {url}",
                pages_scraped=0,
                chunks_indexed=0,
            )

        # Index all scraped content
        texts = [r["text"] for r in results]
        metadatas = [r["metadata"] for r in results]

        total_indexed = await asyncio.to_thread(
            vector_db.add_documents, texts, metadatas, None, url
        )

        return ScrapeResponse(
            status="success",
            message=f"Successfully scraped and indexed {total_indexed} chunks",
            pages_scraped=len(set(m.get("source", url) for m in metadatas)),
            chunks_indexed=total_indexed,
        )

    except Exception as e:
        logger.error("Scrape error", exc_info=e)
        return ScrapeResponse(
            status="error",
            message=str(e),
            pages_scraped=0,
            chunks_indexed=0,
            errors=[str(e)],
        )


@router.post("/upload-pdf", response_model=UploadPDFResponse)
async def upload_pdf(file: UploadFile):
    """Upload and index a PDF document."""
    try:
        from app.ai_agent.scrapers.pdf_ingestor import PDFIngestor

        ingestor = PDFIngestor()
        content = await file.read()

        import tempfile
        import os
        from pathlib import Path

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        try:
            from langchain_community.document_loaders import PyPDFLoader
            loader = PyPDFLoader(tmp_path)
            documents = loader.load()

            texts = []
            metadatas = []
            for doc in documents:
                text = ingestor.clean_text(doc.page_content)
                if len(text) > 20:
                    chunks = ingestor.chunk_text(text)
                    for chunk in chunks:
                        texts.append(chunk)
                        metadatas.append({
                            "category": "pdf",
                            "source": file.filename,
                            "page": doc.metadata.get("page", 0),
                        })

            total_indexed = await asyncio.to_thread(
                vector_db.add_documents, texts, metadatas, None, file.filename
            )

            os.unlink(tmp_path)

            return UploadPDFResponse(
                status="success",
                filename=file.filename,
                chunks_indexed=total_indexed,
                message=f"Successfully indexed {total_indexed} chunks from PDF",
            )
        except ImportError:
            os.unlink(tmp_path)
            return UploadPDFResponse(
                status="error",
                filename=file.filename,
                chunks_indexed=0,
                message="PDF text extraction not available. Install langchain-community and PyPDF2.",
            )

    except Exception as e:
        logger.error("PDF upload error", exc_info=e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/index-all")
async def index_all_websites():
    """Index content from static data + backend API endpoints."""
    from app.ai_agent.scrapers.static_data import StaticDataScraper
    from app.ai_agent.scrapers.api_data import APIDataScraper

    total_chunks = 0
    errors = []

    # Step 1: Index static ITM data
    try:
        static = StaticDataScraper()
        results = await static.scrape()
        if results:
            texts = [r["text"] for r in results]
            metadatas = [r["metadata"] for r in results]
            total_chunks += await asyncio.to_thread(
                vector_db.add_documents, texts, metadatas, None, "static_data"
            )
    except Exception as e:
        errors.append(f"static_data: {str(e)}")

    # Step 2: Fetch from backend API endpoints
    try:
        api = APIDataScraper()
        results = await api.scrape()
        if results:
            texts = [r["text"] for r in results]
            metadatas = [r["metadata"] for r in results]
            total_chunks += await asyncio.to_thread(
                vector_db.add_documents, texts, metadatas, None, "api_data"
            )
    except Exception as e:
        errors.append(f"api_data: {str(e)}")

    return {
        "status": "success" if not errors else "partial",
        "total_chunks_indexed": total_chunks,
        "errors": errors,
    }


@router.post("/reindex")
async def reindex_all():
    """Delete and reindex all content."""
    try:
        await asyncio.to_thread(vector_db.delete_collection)
        await vector_db.initialize()
        return {"status": "success", "message": "Collection cleared and reinitialized"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
