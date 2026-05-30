"""AI Agent configuration - all settings via environment variables."""
from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class AISettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_NAME: str = "ITM Gwalior AI Assistant"
    ENV: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api/ai"

    # CORS
    FRONTEND_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://itm-gwalior.vercel.app,https://anshul32467-itmgwalior.hf.space"

    # NVIDIA AI Endpoints
    NVIDIA_API_KEY: str = ""
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    NVIDIA_MODEL: str = "meta/llama-3.1-70b-instruct"
    NVIDIA_MAX_TOKENS: int = 2048
    NVIDIA_TEMPERATURE: float = 0.1
    NVIDIA_TOP_P: float = 0.9

    # ChromaDB
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    CHROMA_COLLECTION_NAME: str = "itm_gwalior_docs"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Chunking
    CHUNK_SIZE: int = 512
    CHUNK_OVERLAP: int = 64
    RETRIEVAL_K: int = 4

    # Scraping
    SCRAPE_INTERVAL_HOURS: int = 24
    SCRAPE_TIMEOUT_SECONDS: int = 30
    SCRAPE_USER_AGENT: str = (
        "Mozilla/5.0 (compatible; ITM-Gwalior-AI-Bot/1.0; +https://itm-gwalior.vercel.app)"
    )
    MAX_SCRAPE_PAGES: int = 100

    # Websites — ONLY use the new vercel site. Old itmgoi.in has stale data.
    PRIMARY_WEBSITE: str = "https://itm-gwalior.vercel.app"
    LEGACY_WEBSITE: str = ""  # Disabled — old data, do not crawl
    UNIVERSITY_WEBSITE: str = "https://www.itmuniversity.ac.in"
    LMS_URL: str = "https://lms.itmgoi.in"
    ERP_URL: str = "https://mis.itmuniversity.ac.in/itmzone"
    IDEAPAD_URL: str = "https://ideapad.co.in"

    # API Server
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    LOG_LEVEL: str = "INFO"
    RATE_LIMIT: str = "30/minute"

    # Redis (optional, for caching)
    REDIS_URL: str = ""

    @property
    def frontend_origins_list(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_ai_settings() -> AISettings:
    return AISettings()


settings = get_ai_settings()
