"""Pydantic models for AI Agent request/response schemas."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4096, description="User message")
    session_id: str | None = Field(None, description="Optional session ID for chat history")
    stream: bool = Field(True, description="Whether to stream the response")


class ChatResponse(BaseModel):
    answer: str = Field(..., description="AI assistant answer")
    sources: list[dict[str, Any]] = Field(default_factory=list, description="Retrieved sources")
    session_id: str = Field(..., description="Session ID")
    processing_time_ms: int = Field(0, description="Processing time in milliseconds")


class ChatHistoryItem(BaseModel):
    role: str = Field(..., pattern="^(user|assistant)$")
    content: str = Field(...)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class HealthResponse(BaseModel):
    status: str = Field("ok")
    version: str = Field("1.0.0")
    model: str = Field("")
    chroma_connected: bool = Field(False)
    nvidia_connected: bool = Field(False)


class SuggestionResponse(BaseModel):
    suggestions: list[str] = Field(..., description="Suggested questions")


class FacultyResponse(BaseModel):
    name: str
    designation: str = ""
    department: str = ""
    qualification: str = ""
    specialization: str = ""
    email: str = ""
    mobile: str = ""
    subjects: list[str] = Field(default_factory=list)
    profile_image: str = ""
    office_location: str = ""


class ScrapeRequest(BaseModel):
    url: str = Field(..., description="URL to scrape")
    scrape_type: str = Field(
        "auto",
        pattern="^(auto|faculty|admissions|departments|placements|notices|events|pdf|syllabus|timetable)$",
    )


class ScrapeResponse(BaseModel):
    status: str = Field("success", pattern="^(success|error|partial)$")
    message: str = ""
    pages_scraped: int = 0
    chunks_indexed: int = 0
    errors: list[str] = Field(default_factory=list)


class UploadPDFResponse(BaseModel):
    status: str = "success"
    filename: str = ""
    chunks_indexed: int = 0
    message: str = ""
