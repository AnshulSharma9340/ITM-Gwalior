"""Events and workshops scraper."""
from __future__ import annotations

import logging
from typing import Any

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.events-scraper")


class EventsScraper(BaseScraper):
    """Scrapes events, workshops, seminars, and fests."""

    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.event_paths = [
            "/events",
            "/workshops",
            "/seminars",
            "/conferences",
            "/hackathons",
            "/technical-fests",
            "/cultural-fests",
            "/gallery",
        ]

    async def scrape(self) -> list[dict[str, Any]]:
        """Scrape events information."""
        results = []

        for path in self.event_paths:
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
                                "category": "events",
                                "source": url,
                            },
                        })
            except Exception as e:
                logger.warning("Error scraping events page %s: %s", url, str(e))

        logger.info("Events scraping complete", extra={"chunks": len(results)})
        return results
