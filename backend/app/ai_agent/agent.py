"""RAG-based conversational agent with NVIDIA Llama 3.1 integration.

Instead of relying on LangChain's create_agent (which needs native tool-calling
support that Llama 3.1 via NVIDIA doesn't provide), this module uses a manual
Retrieval-Augmented Generation pipeline:

1. Classify the user query → pick the right tool & category
2. Call the tool directly to retrieve data
3. Feed (question + retrieved data) to the LLM for a natural-language answer
4. For general/chitchat queries, call the LLM directly without tools
"""
from __future__ import annotations

import asyncio
import logging
import re
import time
from collections import defaultdict
from typing import Any, AsyncGenerator

from langchain_core.messages import HumanMessage, SystemMessage
from tenacity import (
    AsyncRetrying,
    retry_if_exception,
    stop_after_attempt,
    wait_exponential,
)

from app.ai_agent.config import settings
from app.ai_agent.tools import search_knowledge_base, query_database

logger = logging.getLogger("ai-agent.agent")

# ── Greeting patterns — respond instantly without LLM ─────────────────────────
_GREETING_PATTERNS = [
    re.compile(r"^(hi|hii|hey|hello|heyy|heya|howdy|yo|sup)\b", re.IGNORECASE),
    re.compile(r"^(good\s*(morning|afternoon|evening|day)|gm|ge|gn)\b", re.IGNORECASE),
    re.compile(r"^(namaste|vanakkam|nomoshkar|sat\s*sri\s*akaal)\b", re.IGNORECASE),
    re.compile(r"^(thanks?|thank you|thx|ty|tysm|thnx)\b", re.IGNORECASE),
    re.compile(r"^(bye|goodbye|cya|see\s*ya|tata|bye\s*bye)\b", re.IGNORECASE),
    re.compile(r"^(what'?s?\s*up|how'?s?\s*it\s*going|how\s*are\s*you|wassup|sup)\b", re.IGNORECASE),
    re.compile(r"^(ok|okay|k|kk|alright|fine)\s*(thanks|thank\s*you)?$", re.IGNORECASE),
]

_GREETING_RESPONSES = {
    "default": "## 👋 Hello! Welcome to ITM Gwalior Assistant!\n\nI'm here to help you with:\n- **Admissions** & **Fee Structure**\n- **Faculty** & **Departments**\n- **Placements** & **Training**\n- **Courses** & **Syllabus**\n- **Hostel** & **Campus Life**\n- **LMS/ERP** & **Examinations**\n- **Events** & **Notices**\n\nHow can I assist you today? 😊",
    "thanks": "You're welcome! 😊 Feel free to ask if you need any more help with ITM Gwalior information.",
    "bye": "Goodbye! 👋 Have a great day! Feel free to come back anytime you need help with ITM Gwalior.",
    "morning": "Good Morning! 🌅 Welcome to ITM Gwalior Assistant. How can I help you today?",
    "afternoon": "Good Afternoon! ☀️ Welcome to ITM Gwalior Assistant. How can I help you today?",
    "evening": "Good Evening! 🌇 Welcome to ITM Gwalior Assistant. How can I help you today?",
}


def _is_greeting(message: str) -> str | None:
    """Check if a message is a simple greeting and return a response key or None."""
    msg = message.strip()
    for pattern in _GREETING_PATTERNS:
        match = pattern.match(msg)
        if match:
            word = match.group(1).lower()
            if word in ("thanks", "thank", "thx", "ty", "tysm", "thnx"):
                return "thanks"
            if word in ("bye", "goodbye", "cya", "see", "tata"):
                return "bye"
            if word in ("good", "gm"):
                full = msg.lower()
                if "morning" in full:
                    return "morning"
                if "afternoon" in full:
                    return "afternoon"
                if "evening" in full:
                    return "evening"
            return "default"
    return None


# ── Query classification ──────────────────────────────────────────────────────
# Maps user intent to (tool_function, category_for_kb_search).
# If tool is None → no retrieval needed, just let the LLM answer directly.

_INTENT_KEYWORDS: dict[str, tuple[str, str | None]] = {
    # (intent_key) → (tool: "kb" | "db", category_or_None)
}

# Keywords that indicate a database query (faculty/HOD/department)
_DB_KEYWORDS = [
    "faculty", "professor", "teacher", "staff", "lecturer",
    "hod", "head of department", "head of",
    "department", "departments",
]

# Keywords → knowledge base category mapping
_KB_CATEGORY_MAP = [
    (["admission", "admissions", "admit", "eligibility", "entrance", "apply", "application"], "admissions"),
    (["fee", "fees", "fee structure", "tuition", "cost", "payment", "scholarship"], "fees"),
    (["placement", "placements", "package", "salary", "recruit", "recruiter", "company", "companies", "placed"], "placements"),
    (["training", "training cell", "internship", "industrial"], "training_cell"),
    (["course", "courses", "program", "programmes", "programs", "b.tech", "btech", "m.tech", "mtech", "mba", "bba", "b.sc", "m.sc", "degree"], "courses"),
    (["syllabus", "curriculum", "subject", "subjects"], "syllabus"),
    (["hostel", "accommodation", "mess", "room", "residential", "dormitory"], "hostel"),
    (["lms", "learning management", "moodle", "online class"], "lms"),
    (["erp", "mis", "itmzone", "student portal"], "erp"),
    (["exam", "examination", "result", "marks", "grade", "grading", "cgpa", "sgpa"], "exam_updates"),
    (["event", "events", "fest", "festival", "cultural", "technical", "seminar", "workshop", "hackathon"], "events"),
    (["notice", "notices", "announcement", "circular", "notification"], "notices"),
    (["library", "books", "e-resources", "journal"], "library"),
    (["contact", "phone", "email", "address", "location", "direction", "map", "campus"], "contact_info"),
    (["timetable", "time table", "schedule", "class timing"], "timetable"),
    (["calendar", "academic calendar", "holiday", "vacation"], "academic_calendar"),
    (["innovation", "startup", "incubation", "ideapad", "innovation cell"], "innovation_cell"),
    (["research", "publication", "paper", "journal", "phd", "doctorate"], "general"),
]

# General chitchat patterns — no tool needed
_CHITCHAT_PATTERNS = [
    re.compile(r"^(who are you|what are you|what can you do|tell me about yourself)", re.IGNORECASE),
    re.compile(r"^(what is itm|tell me about itm|about itm|itm gwalior)", re.IGNORECASE),
    re.compile(r"^(help|help me)\s*$", re.IGNORECASE),
]


def _classify_query(message: str) -> tuple[str, str | None]:
    """Classify user query into (tool_type, category).

    Returns:
        ("db", None)        → use query_database
        ("kb", category)    → use search_knowledge_base with category
        ("chat", None)      → no tool, direct LLM response
    """
    msg_lower = message.lower().strip()

    # Check if it's a chitchat / general question
    for pat in _CHITCHAT_PATTERNS:
        if pat.match(msg_lower):
            return ("chat", None)

    # Check for database-related keywords (faculty/HOD/department)
    for kw in _DB_KEYWORDS:
        if kw in msg_lower:
            return ("db", None)

    # Check for knowledge base category keywords
    for keywords, category in _KB_CATEGORY_MAP:
        for kw in keywords:
            if kw in msg_lower:
                return ("kb", category)

    # Default: search knowledge base with "general" category
    return ("kb", "general")


# ── System prompt (for formatting LLM responses) ─────────────────────────────

SYSTEM_PROMPT = """You are the official AI Assistant of ITM Gwalior (Institute of Technology and Management, Gwalior).

You help students, faculty, and visitors with information about admissions, academics, faculty, placements, ERP, LMS, notices, events, hostel, and campus resources.

**RESPONSE RULES:**
- Your response MUST ALWAYS be in natural human language (English).
- NEVER output raw Python code, function calls, import statements, or JSON.
- NEVER write things like `import json`, `print(json.dumps(...))`, `search_knowledge_base(...)`, `query_database(...)`.
- Use Markdown for readability with proper bullet points, headings, and bold text.
- Separate bullet points with line breaks. Never put multiple bullet points on the same line.
- When providing faculty information, include their designation and department.
- Provide direct, clickable Markdown links to relevant ITM Gwalior web pages when possible (e.g., `[Apply Now](https://itm-gwalior.vercel.app/admissions)`).
- Keep responses concise but complete.

**ANTI-HALLUCINATION:**
- ONLY use the information provided to you. NEVER invent or fabricate any data.
- If no relevant information is available, say: "I don't have that specific information available right now. Please check the official website at https://itm-gwalior.vercel.app or contact the admission helpline."
- If you are unsure, say so honestly.

You represent ITM Gwalior. Be helpful, professional, accurate, and friendly."""

ANSWER_PROMPT_TEMPLATE = """A user asked the following question about ITM Gwalior:

**User Question:** "{question}"

Here is the relevant data retrieved from the ITM Gwalior knowledge base:

---
{context}
---

Based ONLY on the above data, write a helpful, well-formatted Markdown response answering the user's question.
- Include relevant links if available.
- Use bullet points and headings for readability.
- Do NOT invent any information not present in the data above.
- If the data doesn't contain enough information, mention that and suggest visiting https://itm-gwalior.vercel.app"""

CHAT_PROMPT_TEMPLATE = """The user sent this message:

"{question}"

Respond helpfully as the ITM Gwalior AI Assistant. If it's a general question about ITM, answer based on your knowledge that ITM Gwalior (Institute of Technology and Management) is a premier educational institute in Gwalior, Madhya Pradesh, India.

For specific data questions, suggest the user ask about admissions, placements, faculty, courses, fees, hostel, events, etc."""


class AIAssistant:
    """Manages the NVIDIA LLM with manual RAG pipeline (no agent framework)."""

    def __init__(self):
        self._llm = None
        self._initialized = False
        # Simple per-session conversation history (last N messages)
        self._history: dict[str, list[dict]] = defaultdict(list)
        self._max_history = 10

    async def initialize(self) -> None:
        """Initialize the LLM."""
        try:
            if not settings.NVIDIA_API_KEY:
                raise ValueError("NVIDIA_API_KEY is not set")

            from langchain_nvidia_ai_endpoints import ChatNVIDIA

            self._llm = ChatNVIDIA(
                model=settings.NVIDIA_MODEL,
                api_key=settings.NVIDIA_API_KEY,
                base_url=settings.NVIDIA_BASE_URL,
                temperature=settings.NVIDIA_TEMPERATURE,
                max_tokens=settings.NVIDIA_MAX_TOKENS,
                top_p=settings.NVIDIA_TOP_P,
            )

            self._initialized = True
            logger.info(
                "AI Assistant initialized (RAG mode)",
                extra={"model": settings.NVIDIA_MODEL},
            )
        except Exception as e:
            logger.error("Failed to initialize AI Assistant", exc_info=e)
            raise

    def _is_rate_limit_error(self, exc: BaseException) -> bool:
        """Check if an exception is a 429 rate limit error."""
        msg = str(exc).lower()
        return any(x in msg for x in ["429", "too many requests", "rate limit", "rate_limit"])

    def _add_to_history(self, session_id: str, role: str, content: str):
        """Add a message to session history."""
        history = self._history[session_id]
        history.append({"role": role, "content": content})
        # Keep only last N messages
        if len(history) > self._max_history:
            self._history[session_id] = history[-self._max_history:]

    def _get_history_context(self, session_id: str) -> str:
        """Get recent conversation history as context string."""
        history = self._history.get(session_id, [])
        if not history:
            return ""
        lines = []
        for msg in history[-6:]:  # Last 6 messages for context
            role = "User" if msg["role"] == "user" else "Assistant"
            lines.append(f"{role}: {msg['content'][:200]}")
        return "\n".join(lines)

    async def _retrieve_data(self, message: str) -> tuple[str, str]:
        """Retrieve relevant data using the appropriate tool.

        Returns:
            (tool_result, tool_used_description)
        """
        logger.info(f"\n{'='*50}\n[1] USER INPUT:\n{message}\n{'='*50}")
        tool_type, category = _classify_query(message)
        logger.info("Query classified", extra={"tool_type": tool_type, "category": category, "query": message[:80]})
        logger.info(f"\n{'='*50}\n[2] RAG SEARCHING:\nTool Type: {tool_type}, Category: {category}\n{'='*50}")

        if tool_type == "chat":
            return ("", "direct_chat")

        if tool_type == "db":
            try:
                result = await asyncio.to_thread(query_database.invoke, message)
                if result and "no matching data" not in result.lower():
                    return (result, f"query_database")
            except Exception as exc:
                logger.warning("query_database failed", exc_info=exc)

            # Fallback to knowledge base if DB didn't return results
            try:
                result = await asyncio.to_thread(
                    search_knowledge_base.invoke,
                    {"query": message, "category": "faculty"},
                )
                if result and "no indexed content" not in result.lower() and "not relevant" not in result.lower():
                    return (result, "search_knowledge_base(faculty)")
            except Exception as exc:
                logger.warning("KB fallback for DB query failed", exc_info=exc)

            return ("", "no_data")

        # tool_type == "kb"
        cat = category or "general"
        try:
            result = await asyncio.to_thread(
                search_knowledge_base.invoke,
                {"query": message, "category": cat},
            )
            if result and "no indexed content" not in result.lower() and "not relevant" not in result.lower():
                return (result, f"search_knowledge_base({cat})")
        except Exception as exc:
            logger.warning("search_knowledge_base failed", exc_info=exc)

        # Try with "general" if specific category failed
        if cat != "general":
            try:
                result = await asyncio.to_thread(
                    search_knowledge_base.invoke,
                    {"query": message, "category": "general"},
                )
                if result and "no indexed content" not in result.lower() and "not relevant" not in result.lower():
                    return (result, "search_knowledge_base(general)")
            except Exception as exc:
                logger.warning("KB general fallback failed", exc_info=exc)

        return ("", "no_data")

    async def _generate_answer(self, question: str, context: str, session_id: str) -> str:
        """Call the LLM to generate a natural language answer."""
        if context:
            user_prompt = ANSWER_PROMPT_TEMPLATE.format(question=question, context=context)
        else:
            user_prompt = CHAT_PROMPT_TEMPLATE.format(question=question)

        # Add conversation history for context
        history_ctx = self._get_history_context(session_id)
        if history_ctx:
            user_prompt = f"Recent conversation:\n{history_ctx}\n\n{user_prompt}"

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]
        
        logger.info(f"\n{'='*50}\n[4] WHAT THE MODEL SEES (Final Prompt):\nSystem:\n{SYSTEM_PROMPT}\n\nUser:\n{user_prompt}\n{'='*50}")

        async for attempt in AsyncRetrying(
            retry=retry_if_exception(self._is_rate_limit_error),
            stop=stop_after_attempt(4),
            wait=wait_exponential(multiplier=2, min=2, max=30),
            reraise=True,
        ):
            with attempt:
                response = await self._llm.ainvoke(messages)

        if response and response.content and response.content.strip():
            answer = response.content.strip()
            # Fix bullet points lacking newlines
            answer = re.sub(r'(?<!\n)\s*([*-])\s', '\n\\1 ', answer)
            return answer

        return ""

    async def _stream_answer(self, question: str, context: str, session_id: str) -> AsyncGenerator[str, None]:
        """Stream the LLM answer token by token."""
        if context:
            user_prompt = ANSWER_PROMPT_TEMPLATE.format(question=question, context=context)
        else:
            user_prompt = CHAT_PROMPT_TEMPLATE.format(question=question)

        # Add conversation history for context
        history_ctx = self._get_history_context(session_id)
        if history_ctx:
            user_prompt = f"Recent conversation:\n{history_ctx}\n\n{user_prompt}"

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=user_prompt),
        ]
        
        logger.info(f"\n{'='*50}\n[4] WHAT THE MODEL SEES (Final Prompt):\nSystem:\n{SYSTEM_PROMPT}\n\nUser:\n{user_prompt}\n{'='*50}")

        async for attempt in AsyncRetrying(
            retry=retry_if_exception(self._is_rate_limit_error),
            stop=stop_after_attempt(4),
            wait=wait_exponential(multiplier=2, min=2, max=30),
            reraise=True,
        ):
            with attempt:
                async for chunk in self._llm.astream(messages):
                    if chunk.content:
                        yield chunk.content
                break

    async def chat(self, message: str, session_id: str | None = None) -> dict[str, Any]:
        """Process a chat message and return the response."""
        start_time = time.time()
        sid = session_id or "default"

        # Greeting pre-check — respond without calling LLM
        greeting_key = _is_greeting(message)
        if greeting_key:
            answer = _GREETING_RESPONSES.get(greeting_key, _GREETING_RESPONSES["default"])
            return {
                "answer": answer,
                "sources": [],
                "processing_time_ms": int((time.time() - start_time) * 1000),
            }

        if not self._llm:
            return {"answer": "AI Assistant is not initialized. Please try again later.", "sources": []}

        try:
            # Step 1: Retrieve relevant data
            context, tool_used = await self._retrieve_data(message)
            logger.info("Data retrieved", extra={"tool": tool_used, "context_len": len(context)})
            logger.info(f"\n{'='*50}\n[3] RAG RESPONSE (Context):\n{context}\n{'='*50}")

            # Step 2: Generate answer using LLM
            answer = await self._generate_answer(message, context, sid)
            
            logger.info(f"\n{'='*50}\n[5] MODEL RESPONSE:\n{answer}\n{'='*50}")

            # Step 3: Fallback if LLM returned empty
            if not answer or not answer.strip():
                answer = (
                    "I wasn't able to find specific information for your query. "
                    "Please try rephrasing your question, or contact ITM administration "
                    "at [itmgoi.in](https://www.itmgoi.in) for accurate details."
                )

            processing_time = int((time.time() - start_time) * 1000)

            # Save to history
            self._add_to_history(sid, "user", message)
            self._add_to_history(sid, "assistant", answer)

            return {
                "answer": answer,
                "sources": [],
                "processing_time_ms": processing_time,
            }
        except Exception as e:
            logger.error("Chat error", exc_info=e)
            return {
                "answer": "I encountered an error processing your request. Please try again or contact ITM administration for assistance.",
                "sources": [],
                "processing_time_ms": int((time.time() - start_time) * 1000),
            }

    async def stream_chat(
        self, message: str, session_id: str | None = None
    ) -> AsyncGenerator[str, None]:
        """Stream a chat response token by token."""
        start_time = time.time()
        sid = session_id or "default"

        # Greeting pre-check
        greeting_key = _is_greeting(message)
        if greeting_key:
            answer = _GREETING_RESPONSES.get(greeting_key, _GREETING_RESPONSES["default"])
            yield answer
            return

        if not self._llm:
            yield "AI Assistant is not initialized. Please try again later."
            return

        try:
            # Step 1: Retrieve relevant data (non-streaming)
            context, tool_used = await self._retrieve_data(message)
            logger.info("Data retrieved for stream", extra={"tool": tool_used, "context_len": len(context)})
            logger.info(f"\n{'='*50}\n[3] RAG RESPONSE (Context):\n{context}\n{'='*50}")

            # Step 2: Stream the LLM answer
            full_answer = ""
            async for token in self._stream_answer(message, context, sid):
                full_answer += token
                yield token
                
            logger.info(f"\n{'='*50}\n[5] MODEL RESPONSE:\n{full_answer}\n{'='*50}")

            # Fallback if nothing was generated
            if not full_answer.strip():
                fallback = (
                    "I wasn't able to find specific information for your query. "
                    "Please try rephrasing your question, or visit "
                    "[ITM Gwalior website](https://itm-gwalior.vercel.app) for details."
                )
                yield fallback
                full_answer = fallback

            # Save to history
            self._add_to_history(sid, "user", message)
            self._add_to_history(sid, "assistant", full_answer)

        except Exception as e:
            logger.error("Stream chat error", exc_info=e)
            yield "\n\nI encountered an error. Please try again or contact ITM administration."

    def get_suggestions(self) -> list[str]:
        """Return suggested questions for new users."""
        return [
            "What are the admission requirements for B.Tech?",
            "Show me the faculty list for CSE department",
            "What was the highest placement package last year?",
            "How do I access the LMS portal?",
            "What is the fee structure for MBA?",
            "Tell me about hostel facilities",
            "When are the upcoming events?",
            "What programs does ITM Gwalior offer?",
        ]

    @property
    def is_initialized(self) -> bool:
        return self._initialized


# Singleton instance
assistant = AIAssistant()
