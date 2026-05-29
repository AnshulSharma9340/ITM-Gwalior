"""ChromaDB vector database integration for RAG pipeline."""
from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Any

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer

from app.ai_agent.config import settings

logger = logging.getLogger("ai-agent.database")


class VectorDatabase:
    """Manages ChromaDB vector store with sentence-transformers embeddings."""

    def __init__(self):
        self._client: chromadb.ClientAPI | None = None
        self._collection: chromadb.Collection | None = None
        self._embedding_model: SentenceTransformer | None = None
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize ChromaDB client and embedding model."""
        try:
            persist_dir = Path(settings.CHROMA_PERSIST_DIR)
            persist_dir.mkdir(parents=True, exist_ok=True)

            self._client = chromadb.PersistentClient(
                path=str(persist_dir),
                settings=ChromaSettings(anonymized_telemetry=False),
            )

            self._collection = self._client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                metadata={"description": "ITM Gwalior institutional documents"},
            )

            logger.info(
                "ChromaDB initialized",
                extra={"persist_dir": str(persist_dir), "collection": settings.CHROMA_COLLECTION_NAME},
            )
            self._initialized = True
        except Exception as e:
            logger.error("Failed to initialize ChromaDB", exc_info=e)
            raise

    def _get_embedding_model(self) -> SentenceTransformer:
        """Lazy-load the embedding model."""
        if self._embedding_model is None:
            self._embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL)
        return self._embedding_model

    def _compute_id(self, text: str, source: str = "", chunk_index: int = 0) -> str:
        """Compute a deterministic ID for a text chunk."""
        raw = f"{source}:{chunk_index}:{text[:100]}"
        return hashlib.md5(raw.encode()).hexdigest()

    def add_documents(
        self,
        texts: list[str],
        metadatas: list[dict[str, Any]] | None = None,
        ids: list[str] | None = None,
        source: str = "",
    ) -> int:
        """Add documents to the vector store.
        Called by sync LangChain tools. For async contexts, wrap with asyncio.to_thread()."""
        if not self._collection:
            logger.error("ChromaDB not initialized")
            return 0

        if not texts:
            return 0

        if metadatas is None:
            metadatas = [{"source": source}] * len(texts)
        else:
            for i, meta in enumerate(metadatas):
                meta.setdefault("source", source)

        if ids is None:
            ids = [self._compute_id(t, source, i) for i, t in enumerate(texts)]

        try:
            embeddings = self._get_embedding_model().encode(texts, show_progress_bar=False).tolist()

            batch_size = 100
            total_added = 0
            for i in range(0, len(texts), batch_size):
                batch_end = min(i + batch_size, len(texts))
                self._collection.add(
                    ids=ids[i:batch_end],
                    embeddings=embeddings[i:batch_end],
                    documents=texts[i:batch_end],
                    metadatas=metadatas[i:batch_end],
                )
                total_added += batch_end - i

            logger.info(
                "Documents added to vector store",
                extra={"count": total_added, "source": source},
            )
            return total_added
        except Exception as e:
            logger.error("Failed to add documents", exc_info=e)
            return 0

    def similarity_search(
        self,
        query: str,
        k: int | None = None,
        filter_metadata: dict[str, str] | None = None,
    ) -> list[dict[str, Any]]:
        """Search for similar documents in the vector store."""
        if not self._collection:
            logger.error("ChromaDB not initialized")
            return []

        k = k or settings.RETRIEVAL_K

        try:
            query_embedding = self._get_embedding_model().encode(query).tolist()

            where = None
            if filter_metadata:
                where = {k: v for k, v in filter_metadata.items()}

            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=k,
                where=where,
                include=["documents", "metadatas", "distances"],
            )

            documents: list[str] = results.get("documents", [[]])[0]
            metadatas: list[dict[str, Any]] = results.get("metadatas", [[]])[0]
            distances: list[float] = results.get("distances", [[]])[0]

            formatted_results = []
            for doc, meta, dist in zip(documents, metadatas, distances):
                formatted_results.append({
                    "content": doc,
                    "metadata": meta,
                    "score": float(1.0 - dist) if dist is not None else 0.0,
                })

            return formatted_results
        except Exception as e:
            logger.error("Failed to search vector store", exc_info=e)
            return []

    def count_documents(self) -> int:
        """Count total documents in the collection."""
        if not self._collection:
            return 0
        try:
            return self._collection.count()
        except Exception:
            return 0

    def delete_collection(self) -> bool:
        """Delete and recreate the collection."""
        if not self._client:
            return False
        try:
            self._client.delete_collection(settings.CHROMA_COLLECTION_NAME)
            self._collection = self._client.create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                metadata={"description": "ITM Gwalior institutional documents"},
            )
            logger.info("Collection deleted and recreated")
            return True
        except Exception as e:
            logger.error("Failed to delete collection", exc_info=e)
            return False

    @property
    def is_initialized(self) -> bool:
        return self._initialized


# Singleton instance
vector_db = VectorDatabase()
