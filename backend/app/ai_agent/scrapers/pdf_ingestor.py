"""Ingest PDF documents into the vector database."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from app.ai_agent.scrapers.base import BaseScraper

logger = logging.getLogger("ai-agent.pdf-ingestor")


class PDFIngestor(BaseScraper):
    """Downloads and indexes PDF documents from URLs or local files."""

    def __init__(self, pdf_dir: str = "./pdfs"):
        super().__init__()
        self.pdf_dir = Path(pdf_dir)
        self.pdf_dir.mkdir(parents=True, exist_ok=True)

    async def scrape(self) -> list[dict[str, Any]]:
        """PDF ingestion requires explicit URLs - use ingest_pdf() instead."""
        logger.warning("PDFIngestor.scrape() called directly. Use ingest_pdf(url) instead.")
        return []

    async def ingest_pdf(self, url: str, category: str = "pdf") -> list[dict[str, Any]]:
        """Download a PDF and extract its text content."""
        results = []

        try:
            # Download PDF
            client = await self._get_client()
            response = await client.get(url)
            response.raise_for_status()

            # Save PDF locally
            filename = url.split("/")[-1] or "document.pdf"
            filepath = self.pdf_dir / filename

            with open(filepath, "wb") as f:
                f.write(response.content)

            # Extract text using PyPDFLoader
            try:
                from langchain_community.document_loaders import PyPDFLoader

                loader = PyPDFLoader(str(filepath))
                documents = loader.load()

                for doc in documents:
                    text = self.clean_text(doc.page_content)
                    if len(text) > 20:
                        chunks = self.chunk_text(text)
                        for i, chunk in enumerate(chunks):
                            results.append({
                                "text": chunk,
                                "metadata": {
                                    "category": category,
                                    "source": url,
                                    "filename": filename,
                                    "page": doc.metadata.get("page", 0),
                                },
                            })
            except ImportError:
                # Fallback: basic text extraction
                logger.warning("PyPDFLoader not available, using basic extraction")
                import PyPDF2

                with open(filepath, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    full_text = ""
                    for page in reader.pages:
                        full_text += page.extract_text() + "\n\n"

                text = self.clean_text(full_text)
                chunks = self.chunk_text(text)
                for i, chunk in enumerate(chunks):
                    results.append({
                        "text": chunk,
                        "metadata": {
                            "category": category,
                            "source": url,
                            "filename": filename,
                        },
                    })

            logger.info("PDF ingested", extra={"url": url, "chunks": len(results)})

        except Exception as e:
            logger.error("Failed to ingest PDF %s: %s", url, str(e))

        return results
