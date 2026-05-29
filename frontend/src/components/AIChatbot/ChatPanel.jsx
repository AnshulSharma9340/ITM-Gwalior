import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SuggestedPrompts from './SuggestedPrompts';
import { aiAgentAPI } from '../../api/ai-agent';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `## 🏛️ Welcome to ITM Gwalior Assistant!

I'm here to help you with information about:
- **Admissions** & **Fee Structure**
- **Faculty** & **Departments**
- **Placements** & **Training**
- **Courses** & **Syllabus**
- **Hostel** & **Campus Life**

How can I help you today? 😊`,
};

const ChatPanel = ({ onClose, isOpen }) => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load suggestions on mount
  useEffect(() => {
    aiAgentAPI.getSuggestions().then(data => {
      if (data?.suggestions?.length) {
        setSuggestions(data.suggestions);
      }
    }).catch(() => {});
  }, []);

  // Scroll to bottom on new messages
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleClearChat = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the chat?')) {
      setMessages([WELCOME_MESSAGE]);
      setShowSuggestions(true);
      setInputValue('');
    }
  }, []);

  const handleSend = useCallback(async (text) => {
    const message = (text || inputValue).trim();
    if (!message || isLoading) return;

    setInputValue('');
    setShowSuggestions(false);

    // Remove any previous error messages
    setMessages(prev => prev.filter(m => !m.isError));

    // Add user message
    const userMessage = { role: 'user', content: message };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Add empty assistant message for streaming
    const assistantMsg = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMsg]);

    let fullContent = '';
    await aiAgentAPI.chatStream(
      message,
      // onToken
      (token) => {
        fullContent += token;
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = { ...updated[updated.length - 1], content: fullContent };
          updated[updated.length - 1] = lastMsg;
          return updated;
        });
      },
      // onDone
      () => {
        setIsLoading(false);
        setMessages(prev => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg.role === 'assistant' && (!lastMsg.content || !lastMsg.content.trim())) {
            lastMsg.content = "I'm sorry, I couldn't find the specific information for that query. Please check the website at https://itm-gwalior.vercel.app for more details.";
          }
          return updated;
        });
      },
      // onError
      (error) => {
        setIsLoading(false);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            isError: true,
            content: "I encountered an error connecting to the server. Please check your network or try again later.",
          };
          return updated;
        });
      }
    );
  }, [inputValue, isLoading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleSuggestionClick = useCallback((prompt) => {
    handleSend(prompt);
  }, [handleSend]);

  const hasError = messages.length > 0 && messages[messages.length - 1].isError;
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-20 w-[360px] sm:w-[420px] h-[700px] max-h-[85vh] 
            bg-white/95 dark:bg-gray-900/95 backdrop-blur-3xl 
            rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40
            border border-rose-100/50 dark:border-gray-700/50
            flex flex-col overflow-hidden z-[9999]"
          style={{
            boxShadow: '0 35px 70px -15px rgba(0, 0, 0, 0.35), 0 10px 30px -8px rgba(128, 0, 0, 0.15), 0 0 0 1px rgba(128, 0, 0, 0.08)',
          }}
        >
          {/* Header */}
          <div className="relative flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-rose-600 to-[#800000] border-b border-[#5a0000] shadow-sm z-10">
            <div className="absolute inset-0 bg-[url('/pattern.png')] opacity-10 mix-blend-overlay"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg ring-2 ring-white/20 p-1">
                  <svg className="w-full h-full text-[#800000]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Ears */}
                    <path d="M28 42 H22 A6 6 0 0 0 16 48 V52 A6 6 0 0 0 22 58 H28" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M72 42 H78 A6 6 0 0 1 84 48 V52 A6 6 0 0 1 78 58 H72" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Head */}
                    <rect x="28" y="32" width="44" height="32" rx="10" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                    
                    {/* Antenna */}
                    <path d="M50 32 V20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="50" cy="14" r="6" fill="currentColor" />
                    
                    {/* Eyes */}
                    <circle cx="40" cy="48" r="5" fill="currentColor" />
                    <circle cx="60" cy="48" r="5" fill="currentColor" />
                    
                    {/* Body */}
                    <path d="M38 70 Q50 92 62 70 Z" fill="currentColor" />
                    
                    {/* Arms */}
                    <path d="M34 76 L26 76" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    <path d="M66 76 L74 76" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm tracking-wide">ITM Assistant</h3>
                <p className="text-[11px] text-rose-200 font-medium flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                  </span>
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 relative z-10">
              <button
                onClick={handleClearChat}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-rose-100 hover:text-white active:scale-90"
                title="Clear Chat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 text-rose-100 hover:text-white active:scale-90"
                title="Minimize (Esc)"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto py-4 space-y-4 scroll-smooth bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-900 relative
              [&::-webkit-scrollbar]:w-1.5
              [&::-webkit-scrollbar-track]:bg-transparent
              [&::-webkit-scrollbar-thumb]:bg-gray-300/80
              [&::-webkit-scrollbar-thumb]:rounded-full
              dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-6 opacity-60">
                <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-gray-800 flex items-center justify-center mb-3 p-3">
                  <svg className="w-full h-full text-[#800000] dark:text-rose-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Ears */}
                    <path d="M28 42 H22 A6 6 0 0 0 16 48 V52 A6 6 0 0 0 22 58 H28" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M72 42 H78 A6 6 0 0 1 84 48 V52 A6 6 0 0 1 78 58 H72" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Head */}
                    <rect x="28" y="32" width="44" height="32" rx="10" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
                    
                    {/* Antenna */}
                    <path d="M50 32 V20" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    <circle cx="50" cy="14" r="6" fill="currentColor" />
                    
                    {/* Eyes */}
                    <circle cx="40" cy="48" r="5" fill="currentColor" />
                    <circle cx="60" cy="48" r="5" fill="currentColor" />
                    
                    {/* Body */}
                    <path d="M38 70 Q50 92 62 70 Z" fill="currentColor" />
                    
                    {/* Arms */}
                    <path d="M34 76 L26 76" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    <path d="M66 76 L74 76" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a conversation by typing below</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                // Don't render empty assistant message while loading (typing indicator handles it)
                if (msg.role === 'assistant' && (!msg.content || !msg.content.trim())) {
                  return null;
                }
                return <MessageBubble key={index} message={msg} index={index} />;
              })
            )}
            
            {/* Show typing indicator only when streaming hasn't yielded content yet */}
            {isLoading && messages[messages.length - 1]?.content === '' && (
              <TypingIndicator />
            )}
            
            {/* Show retry button on error */}
            {hasError && lastUserMessage && (
              <div className="flex justify-center my-2 animate-in fade-in">
                <button
                  onClick={() => handleSend(lastUserMessage)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-rose-200 dark:border-gray-700 rounded-full text-sm font-medium text-rose-600 shadow-sm hover:shadow-md hover:bg-rose-50 dark:hover:bg-gray-700 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry Request
                </button>
              </div>
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Suggested Prompts */}
          {showSuggestions && suggestions.length > 0 && !hasError && (
            <SuggestedPrompts
              onSelect={handleSuggestionClick}
              suggestions={suggestions}
            />
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-rose-100/80 dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
            <div
              className={`flex items-end gap-2 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5
                border transition-all duration-200 shadow-inner
                ${isLoading 
                  ? 'border-gray-200 dark:border-gray-700 opacity-70' 
                  : 'border-rose-200 dark:border-gray-700 focus-within:border-[#800000] dark:focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-[#800000]/10 dark:focus-within:ring-rose-500/20'
                }`}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question..."
                className="flex-1 bg-transparent outline-none resize-none text-[13px] sm:text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 max-h-28 py-0.5 leading-relaxed"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isLoading}
                className="flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br from-rose-600 to-[#800000] text-white
                  disabled:opacity-40 disabled:cursor-not-allowed
                  hover:from-rose-700 hover:to-[#5a0000]
                  hover:shadow-lg hover:shadow-rose-900/30
                  active:scale-95
                  transition-all duration-200
                  shadow-md shadow-rose-900/20"
              >
                {isLoading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-600 text-center mt-2 font-medium tracking-wide">
              AI responses can be inaccurate. Verify important info.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(ChatPanel);
