"""General-purpose website crawler that discovers and indexes all pages."""
from __future__ import annotations

import asyncio
import logging
import re
from typing import Any
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.crawler")


class WebsiteCrawler(BaseScraper):
    """Crawls a website, discovers pages, and indexes content."""

    def __init__(self, base_url: str, max_pages: int = 100):
        super().__init__()
        self.base_url = base_url.rstrip("/")
        self.max_pages = max_pages
        self.to_visit: list[str] = [self.base_url]
        self.seen_urls: set[str] = set()
        self.domain = urlparse(self.base_url).netloc

    def _is_same_domain(self, url: str) -> bool:
        """Check if URL belongs to the same domain."""
        parsed = urlparse(url)
        return parsed.netloc == self.domain or not parsed.netloc

    def _should_skip(self, url: str) -> bool:
        """Check if URL should be skipped."""
        skip_patterns = [
            r"\.(pdf|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$",
            r"/(cdn-cgi|wp-content|wp-admin|wp-includes)/",
            r"(mailto:|tel:|javascript:)",
            r"/api/",
        ]
        return any(re.search(pattern, url, re.IGNORECASE) for pattern in skip_patterns)

    async def scrape(self) -> list[dict[str, Any]]:
        """Crawl the website and index all discovered pages."""
        results = []

        while self.to_visit and len(self.seen_urls) < self.max_pages:
            url = self.to_visit.pop(0)
            if url in self.seen_urls:
                continue

            self.seen_urls.add(url)

            try:
                html = await self.fetch_page(url)
                if not html:
                    continue

                text = self.extract_text(html)
                if len(text) < 50:
                    continue

                # Determine category from URL path and content
                category = self._categorize_content(url, text)

                chunks = self.chunk_text(text)
                for chunk in chunks:
                    if len(chunk) > 30:
                        results.append({
                            "text": chunk,
                            "metadata": {
                                "category": category,
                                "source": url,
                                "url": url,
                            },
                        })

                # Discover more links
                soup = BeautifulSoup(html, "html.parser")
                for link in soup.find_all("a", href=True):
                    href = link["href"]
                    full_url = urljoin(url, href)
                    full_url = full_url.split("#")[0].split("?")[0].rstrip("/")

                    if (
                        self._is_same_domain(full_url)
                        and full_url not in self.seen_urls
                        and full_url not in self.to_visit
                        and not self._should_skip(full_url)
                    ):
                        self.to_visit.append(full_url)

                await asyncio.sleep(0.1)  # Rate limiting

            except Exception as e:
                logger.debug("Error crawling %s: %s", url, str(e))

        logger.info(
            "Crawl complete",
            extra={"pages": len(self.seen_urls), "chunks": len(results)},
        )
        return results

    def _categorize_content(self, url: str, text: str) -> str:
        """Categorize content based on URL path and text content."""
        url_lower = url.lower()
        text_lower = text.lower()

        # URL-based categorization
        if any(p in url_lower for p in ["/faculty", "/teacher", "/professor", "/hod", "/staff"]):
            return "faculty"
        if any(p in url_lower for p in ["/admission", "/apply", "/eligibility"]):
            return "admissions"
        if any(p in url_lower for p in ["/placement", "/tap", "/training", "/recruit"]):
            return "placements"
        if any(p in url_lower for p in ["/course", "/program", "/curriculum", "/syllabus"]):
            return "courses"
        if any(p in url_lower for p in ["/department", "/dept", "/cs", "/it", "/ece", "/me", "/ce", "/mba"]):
            return "departments"
        if any(p in url_lower for p in ["/event", "/workshop", "/seminar", "/conference", "/fest"]):
            return "events"
        if any(p in url_lower for p in ["/notice", "/circular", "/announcement", "/exam"]):
            return "notices"
        if any(p in url_lower for p in ["/fee", "/payment", "/scholarship"]):
            return "fees"
        if any(p in url_lower for p in ["/hostel", "/accommodation"]):
            return "hostel"
        if any(p in url_lower for p in ["/library", "/books", "/digital"]):
            return "library"
        if any(p in url_lower for p in ["/contact", "/reach", "/get-in-touch"]):
            return "contact_info"
        if any(p in url_lower for p in ["/lms", "/learning", "/e-learning", "/moodle"]):
            return "lms"
        if any(p in url_lower for p in ["/erp", "/mis", "/student-portal"]):
            return "erp"
        if any(p in url_lower for p in ["/timetable", "/schedule", "/time-table"]):
            return "timetable"
        if any(p in url_lower for p in ["/calendar", "/academic-calendar"]):
            return "academic_calendar"
        if any(p in url_lower for p in ["/innovation", "/incubation", "/startup", "/research"]):
            return "innovation_cell"

        # Content-based categorization for pages without clear URL patterns
        if "faculty" in text_lower and ("professor" in text_lower or "department" in text_lower):
            return "faculty"
        if "admission" in text_lower and ("apply" in text_lower or "eligibility" in text_lower):
            return "admissions"

        return "general"
