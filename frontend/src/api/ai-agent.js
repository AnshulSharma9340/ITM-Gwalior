/**
 * AI Agent API client for ITM Gwalior chatbot.
 * Handles communication with the FastAPI backend.
 */
const AI_AGENT_API_URL = import.meta.env.VITE_AI_AGENT_URL || '/api/ai';

class AIAgentAPI {
  constructor(baseUrl = AI_AGENT_API_URL) {
    this.baseUrl = baseUrl;
    this.sessionId = this._loadSessionId();
  }

  _loadSessionId() {
    const stored = sessionStorage.getItem('ai_agent_session_id');
    if (stored) return stored;
    const newId = crypto.randomUUID ? crypto.randomUUID() : 
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
    sessionStorage.setItem('ai_agent_session_id', newId);
    return newId;
  }

  /**
   * Send a chat message and get a streaming response.
   * @param {string} message - User message
   * @param {function} onToken - Callback for each token
   * @param {function} onDone - Callback when streaming completes
   * @param {function} onError - Callback on error
   * @returns {Promise<void>}
   */
  async chatStream(message, onToken, onDone, onError) {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify({
          message,
          session_id: this.sessionId,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                onToken(data.token);
              }
              if (data.done) {
                if (data.session_id) {
                  this.sessionId = data.session_id;
                  sessionStorage.setItem('ai_agent_session_id', data.session_id);
                }
                onDone();
              }
              if (data.error) {
                onError(new Error(data.error));
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      onError(error);
    }
  }

  /**
   * Send a chat message (non-streaming).
   */
  async chat(message) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        session_id: this.sessionId,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.session_id) {
      this.sessionId = data.session_id;
      sessionStorage.setItem('ai_agent_session_id', data.session_id);
    }
    return data;
  }

  /**
   * Get suggested questions.
   */
  async getSuggestions() {
    const response = await fetch(`${this.baseUrl}/chat/suggestions`);
    if (!response.ok) return { suggestions: [] };
    return response.json();
  }

  /**
   * Get health status.
   */
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/manage/health`);
    if (!response.ok) return { status: 'unavailable' };
    return response.json();
  }

  /**
   * Search indexed data.
   */
  async search(query, category = null) {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    const response = await fetch(`${this.baseUrl}/data/search?${params}`);
    if (!response.ok) return { results: [], count: 0 };
    return response.json();
  }

  /**
   * Crawl all ITM websites and index their content into the vector store.
   */
  async indexAll() {
    const response = await fetch(`${this.baseUrl}/manage/index-all`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Delete all indexed content from the vector store.
   */
  async reindex() {
    const response = await fetch(`${this.baseUrl}/manage/reindex`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }
}

export const aiAgentAPI = new AIAgentAPI();
export default AIAgentAPI;
