"""Scraper that fetches data from backend API endpoints.

Instead of scraping the React SPA (empty HTML shells) or the old PHP site (stale data),
this calls the FastAPI backend endpoints directly to get structured JSON data.
"""
from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.api-data")

# Backend API base URLs to try (local dev first, then production)
BACKEND_URLS = [
    "http://localhost:8000",
    "https://anshul32467-itmgwalior.hf.space",
]

# Public API endpoints to fetch data from
API_ENDPOINTS = [
    {"path": "/api/public/about/officials", "category": "general", "label": "Officials"},
    {"path": "/api/public/about/board", "category": "general", "label": "Board of Governors"},
    {"path": "/api/departments", "category": "departments", "label": "Departments"},
    {"path": "/api/placements/stats", "category": "placements", "label": "Placement Statistics"},
    {"path": "/api/research/publications", "category": "general", "label": "Research Publications"},
    {"path": "/api/public/events", "category": "events", "label": "Events"},
]


class APIDataScraper(BaseScraper):
    """Fetches data from backend API endpoints and indexes it."""

    def __init__(self):
        super().__init__()

    async def _find_working_url(self) -> str | None:
        """Find a working backend URL."""
        async with httpx.AsyncClient(timeout=5) as client:
            for base_url in BACKEND_URLS:
                try:
                    resp = await client.get(f"{base_url}/")
                    if resp.status_code == 200:
                        logger.info(f"Backend found at {base_url}")
                        return base_url
                except Exception:
                    continue
        return None

    async def scrape(self) -> list[dict[str, Any]]:
        """Fetch data from backend API and return indexable chunks."""
        results = []

        base_url = await self._find_working_url()
        if not base_url:
            logger.warning("No backend URL reachable — skipping API data indexing")
            return results

        async with httpx.AsyncClient(timeout=15) as client:
            for endpoint in API_ENDPOINTS:
                url = f"{base_url}{endpoint['path']}"
                try:
                    resp = await client.get(url)
                    if resp.status_code != 200:
                        logger.debug(f"SKIP {url} → {resp.status_code}")
                        continue

                    data = resp.json()
                    chunks = self._format_response(endpoint, data)
                    results.extend(chunks)
                    logger.info(f"Fetched {endpoint['label']}: {len(chunks)} chunks")

                except Exception as e:
                    logger.warning(f"Failed to fetch {url}: {e}")

        return results

    def _format_response(self, endpoint: dict, data: Any) -> list[dict[str, Any]]:
        """Convert API JSON response into indexable text chunks."""
        chunks = []
        label = endpoint["label"]
        category = endpoint["category"]

        if isinstance(data, list):
            # Array of items (officials, departments, etc.)
            for item in data:
                text = self._item_to_text(item, label)
                if text and len(text) > 20:
                    chunks.append({
                        "text": text,
                        "metadata": {"category": category, "source": f"api:{label}", "url": f"https://itm-gwalior.vercel.app"},
                    })
        elif isinstance(data, dict):
            # Single object or wrapped response
            items = data.get("items") or data.get("data") or data.get("results") or [data]
            if isinstance(items, list):
                for item in items:
                    text = self._item_to_text(item, label)
                    if text and len(text) > 20:
                        chunks.append({
                            "text": text,
                            "metadata": {"category": category, "source": f"api:{label}", "url": f"https://itm-gwalior.vercel.app"},
                        })
            else:
                text = self._item_to_text(items, label)
                if text and len(text) > 20:
                    chunks.append({
                        "text": text,
                        "metadata": {"category": category, "source": f"api:{label}", "url": f"https://itm-gwalior.vercel.app"},
                    })

        return chunks

    def _item_to_text(self, item: Any, label: str) -> str:
        """Convert a single API item into readable text."""
        if not isinstance(item, dict):
            return str(item) if item else ""

        parts = []

        # Common fields
        name = item.get("name") or item.get("title") or ""
        role = item.get("role") or item.get("designation") or item.get("position") or ""
        dept = item.get("department") or item.get("dept") or ""
        qual = item.get("qualification") or item.get("qual") or ""
        email = item.get("email") or ""
        phone = item.get("phone") or item.get("mobile") or ""
        bio = item.get("bio") or item.get("description") or item.get("about") or ""

        if name:
            line = f"**{name}**"
            if role:
                line += f" — {role}"
            if dept:
                line += f", {dept}"
            parts.append(line)

        if qual:
            parts.append(f"Qualification: {qual}")
        if email:
            parts.append(f"Email: {email}")
        if phone:
            parts.append(f"Phone: {phone}")
        if bio:
            parts.append(bio[:400])

        # Department-specific fields
        code = item.get("code") or ""
        if code and name:
            parts.insert(0, f"## {name} ({code})")

        intake = item.get("intake") or ""
        if intake:
            parts.append(f"Intake: {intake}")

        established = item.get("established_year") or item.get("established") or ""
        if established:
            parts.append(f"Established: {established}")

        # Placement fields
        avg_lpa = item.get("average_lpa") or item.get("avg_package") or ""
        high_lpa = item.get("highest_lpa") or item.get("highest_package") or ""
        if avg_lpa:
            parts.append(f"Average Package: {avg_lpa} LPA")
        if high_lpa:
            parts.append(f"Highest Package: {high_lpa} LPA")

        return "\n".join(parts) if parts else ""
