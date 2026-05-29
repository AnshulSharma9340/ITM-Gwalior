"""Notices and announcements scraper."""
from __future__ import annotations

import logging
from typing import Any

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.notices-scraper")


class NoticesScraper(BaseScraper):
    """Scrapes notices, circulars, and announcements."""

    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.notice_paths = [
            "/notices",
            "/announcements",
            "/circulars",
            "/exam-notices",
            "/examinations",
            "/latest-news",
            "/updates",
        ]

    async def scrape(self) -> list[dict[str, Any]]:
        """Scrape notices and announcements."""
        results = []

        for path in self.notice_paths:
            url = f"{self.base_url}{path}"
            try:
                html = await self.fetch_page(url)
                if not html:
                    continue

                text = self.extract_text(html)
                if len(text) < 30:
                    continue

                chunks = self.chunk_text(text)
                for chunk in chunks:
                    if len(chunk) > 30:
                        results.append({
                            "text": chunk,
                            "metadata": {
                                "category": "notices",
                                "source": url,
                            },
                        })
            except Exception as e:
                logger.warning("Error scraping notices page %s: %s", url, str(e))

        logger.info("Notices scraping complete", extra={"chunks": len(results)})
        return results
