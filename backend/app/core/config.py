from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    APP_NAME: str = "ITM Gwalior API"
    ENV: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    TZ: str = "Asia/Kolkata"

    # CORS
    FRONTEND_ORIGINS: str = "http://localhost:5173,http://localhost:3000,https://itm-gwalior.vercel.app,https://anshul32467-itmgwalior.hf.space"

    # Database
    DATABASE_URL: str = "sqlite:///./itmgoi.db"
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_TTL_MIN: int = 15
    REFRESH_TOKEN_TTL_DAYS: int = 14
    PASSWORD_MIN_LENGTH: int = 8
    LOGIN_LOCKOUT_THRESHOLD: int = 5
    LOGIN_LOCKOUT_WINDOW_MIN: int = 15

    # Default super-admin
    DEFAULT_ADMIN_USERNAME: str = "admin"
    DEFAULT_ADMIN_EMAIL: str = "admin@itmgoi.in"
    DEFAULT_ADMIN_PASSWORD: str = "admin123"

    # Storage
    STORAGE_BACKEND: Literal["local", "s3"] = "local"
    UPLOAD_DIR: str = "./uploads"
    PUBLIC_MEDIA_BASE_URL: str = "/uploads"
    MAX_UPLOAD_MB_IMAGE: int = 10
    MAX_UPLOAD_MB_PDF: int = 25
    MAX_UPLOAD_MB_VIDEO: int = 200

    # S3 / R2
    S3_ENDPOINT_URL: str = ""
    S3_REGION: str = "auto"
    S3_BUCKET: str = ""
    S3_ACCESS_KEY: str = ""
    S3_SECRET_KEY: str = ""
    S3_PUBLIC_BASE_URL: str = ""

    # SMTP
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@itmgoi.in"
    SMTP_USE_TLS: bool = True

    # Observability
    SENTRY_DSN: str = ""
    LOG_LEVEL: str = "INFO"

    # Rate limits
    RATE_LIMIT_DEFAULT: str = "100/minute"
    RATE_LIMIT_AUTH: str = "10/minute"
    RATE_LIMIT_FORMS: str = "5/minute"

    @field_validator("FRONTEND_ORIGINS")
    @classmethod
    def _origins_have_no_wildcard_in_prod(cls, v: str, info) -> str:
        if info.data.get("ENV") == "production" and "*" in v:
            raise ValueError("FRONTEND_ORIGINS must not contain '*' in production")
        return v

    @property
    def frontend_origins_list(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGINS.split(",") if o.strip()]

    @property
    def is_postgres(self) -> bool:
        return self.DATABASE_URL.startswith(("postgresql", "postgres"))

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
