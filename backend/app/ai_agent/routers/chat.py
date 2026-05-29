"""Chat and conversation API endpoints."""
from __future__ import annotations

import json
import logging
import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse

from app.ai_agent.agent import assistant
from app.ai_agent.models import ChatRequest, ChatResponse

logger = logging.getLogger("ai-agent.chat-router")
router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def chat_endpoint(request: ChatRequest):
    """Process a chat message and return or stream the AI response."""
    try:
        session_id = request.session_id or str(uuid.uuid4())

        if request.stream:
            return StreamingResponse(
                _stream_response(request.message, session_id),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "X-Accel-Buffering": "no",
                    "X-Session-Id": session_id,
                },
            )

        result = await assistant.chat(request.message, session_id)
        return JSONResponse({
            "answer": result["answer"],
            "sources": result.get("sources", []),
            "session_id": session_id,
            "processing_time_ms": result.get("processing_time_ms", 0),
        })

    except Exception as e:
        logger.error("Chat endpoint error", exc_info=e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


async def _stream_response(message: str, session_id: str):
    """Generate streaming response with SSE format."""
    full_answer = ""
    try:
        async for token in assistant.stream_chat(message, session_id):
            full_answer += token
            yield f"data: {json.dumps({'token': token})}\n\n"

        yield f"data: {json.dumps({'done': True, 'session_id': session_id})}\n\n"
    except Exception as e:
        logger.error("Stream error", exc_info=e)
        yield f"data: {json.dumps({'error': 'Stream error occurred'})}\n\n"


@router.get("/suggestions")
async def get_suggestions():
    """Return suggested questions for new users."""
    return {"suggestions": assistant.get_suggestions()}


@router.post("/reset")
async def reset_session(session_id: str | None = None):
    """Reset a chat session's memory."""
    return {"status": "ok", "message": "Session reset"}
