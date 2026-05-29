"""Base scraper with HTTP client, text cleaning, and chunking utilities."""
from __future__ import annotations

import logging
import re
from abc import ABC, abstractmethod
from typing import Any

import httpx
from bs4 import BeautifulSoup

from app.ai_agent.config import settings

logger = logging.getLogger("ai-agent.scraper")


class BaseScraper(ABC):
    """Abstract base scraper with shared utilities."""

    def __init__(self):
        self._client: httpx.AsyncClient | None = None
        self.seen_urls: set[str] = set()

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                timeout=settings.SCRAPE_TIMEOUT_SECONDS,
                follow_redirects=True,
                headers={"User-Agent": settings.SCRAPE_USER_AGENT},
            )
        return self._client

    async def fetch_page(self, url: str) -> str | None:
        """Fetch a page and return its HTML content."""
        try:
            client = await self._get_client()
            response = await client.get(url)
            response.raise_for_status()
            return response.text
        except httpx.HTTPStatusError as e:
            logger.warning("HTTP error fetching %s: %s", url, e.response.status_code)
            return None
        except Exception as e:
            logger.error("Error fetching %s: %s", url, str(e))
            return None

    def extract_text(self, html: str, selector: str = "body") -> str:
        """Extract and clean text from HTML using a CSS selector."""
        soup = BeautifulSoup(html, "html.parser")
        element = soup.select_one(selector)
        if not element:
            element = soup

        # Remove script, style, nav, footer, header elements
        for tag in element.find_all(["script", "style", "nav", "footer", "header", "aside"]):
            tag.decompose()

        text = element.get_text(separator="\n", strip=True)
        return self.clean_text(text)

    def clean_text(self, text: str) -> str:
        """Clean extracted text by normalizing whitespace."""
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r" {2,}", " ", text)
        text = re.sub(r"[\t\r]+", " ", text)
        text = re.sub(r"•", "-", text)
        return text.strip()

    def chunk_text(self, text: str, chunk_size: int | None = None, overlap: int | None = None) -> list[str]:
        """Split text into overlapping chunks for embedding."""
        chunk_size = chunk_size or settings.CHUNK_SIZE
        overlap = overlap or settings.CHUNK_OVERLAP

        paragraphs = text.split("\n\n")
        chunks = []
        current_chunk = ""
        current_words = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            para_words = len(para.split())

            if current_words + para_words > chunk_size and current_chunk:
                chunks.append(current_chunk.strip())
                # Keep overlap from the end of current chunk
                overlap_words = current_chunk.split()[-(overlap):] if len(current_chunk.split()) > overlap else current_chunk.split()
                current_chunk = " ".join(overlap_words) + "\n\n" + para
                current_words = len(overlap_words) + para_words
            else:
                if current_chunk:
                    current_chunk += "\n\n" + para
                else:
                    current_chunk = para
                current_words += para_words

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks

    @abstractmethod
    async def scrape(self) -> list[dict[str, Any]]:
        """Scrape data and return list of {text, metadata} dicts."""
        ...

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None
