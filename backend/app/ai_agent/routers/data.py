"""Data retrieval endpoints exposing indexed information."""
from __future__ import annotations

import asyncio
from typing import Any

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from app.ai_agent.database import vector_db

router = APIRouter(prefix="/data", tags=["data"])


@router.get("/faculty")
async def get_faculty(
    department: str | None = Query(None, description="Filter by department"),
    query: str | None = Query(None, description="Search query"),
):
    """Retrieve faculty information from the vector database."""
    try:
        search_query = query or f"faculty {'in ' + department if department else ''}"
        filter_meta = {"category": "faculty"}
        if department:
            filter_meta["department"] = department

        results = await asyncio.to_thread(
            vector_db.similarity_search, search_query, k=20, filter_metadata=filter_meta
        )

        faculty_list = []
        seen_names = set()
        for r in results:
            content = r["content"]
            meta = r["metadata"]
            name = _extract_name(content)
            if name and name not in seen_names:
                seen_names.add(name)
                faculty_list.append({
                    "name": name,
                    "department": meta.get("department", department or ""),
                    "details": content[:300],
                    "source": meta.get("source", ""),
                })

        return JSONResponse({"faculty": faculty_list, "count": len(faculty_list)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/departments")
async def get_departments():
    """Retrieve department information."""
    try:
        results = await asyncio.to_thread(
            vector_db.similarity_search, "departments CSE IT Mechanical Civil Electronics MBA", k=30, filter_metadata={"category": "departments"}
        )
        departments = [{"content": r["content"][:300], "source": r["metadata"].get("source", "")} for r in results]
        return JSONResponse({"departments": departments, "count": len(departments)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/notices")
async def get_notices():
    """Retrieve notices and announcements."""
    try:
        results = await asyncio.to_thread(
            vector_db.similarity_search, "notices circulars announcements exam updates", k=20, filter_metadata={"category": "notices"}
        )
        notices = [{"content": r["content"][:300], "source": r["metadata"].get("source", ""), "score": r["score"]} for r in results]
        return JSONResponse({"notices": notices, "count": len(notices)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events")
async def get_events():
    """Retrieve events information."""
    try:
        results = await asyncio.to_thread(
            vector_db.similarity_search, "events workshops seminars conferences", k=20, filter_metadata={"category": "events"}
        )
        events = [{"content": r["content"][:300], "source": r["metadata"].get("source", "")} for r in results]
        return JSONResponse({"events": events, "count": len(events)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search")
async def search_all(
    q: str = Query(..., description="Search query"),
    category: str | None = Query(None, description="Filter by category"),
):
    """Search across all indexed content."""
    try:
        filter_meta = {"category": category} if category else None
        results = await asyncio.to_thread(
            vector_db.similarity_search, q, k=10, filter_metadata=filter_meta
        )
        return JSONResponse({"results": results, "count": len(results)})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _extract_name(text: str) -> str | None:
    """Try to extract a person's name from text content."""
    import re

    patterns = [
        r"(?:Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})(?:\s*[-–—]\s*(?:Professor|HOD|Assistant))",
        r"Name[:\\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
    ]

    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            name = match.group(1).strip()
            if 3 < len(name) < 60:
                return name

    return None
