import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatPanel from './ChatPanel';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Global Escape key listener to close chat
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Chat Panel */}
      <ChatPanel isOpen={isOpen} onClose={handleClose} />

      {/* Floating Button */}
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
          className="fixed bottom-6 right-6 z-[9999] flex flex-col items-center"
        >
          {/* Label tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: isOpen ? 0 : 1, y: isOpen ? 5 : 0 }}
            transition={{ delay: isOpen ? 0 : 1.5, duration: 0.3 }}
            className="mb-2 px-3 py-1.5 bg-[#800000] text-white text-[11px] font-bold tracking-wider rounded-lg shadow-lg shadow-[#800000]/30 whitespace-nowrap pointer-events-none"
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Ask ITM Agent
            </span>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#800000] rotate-45" />
          </motion.div>

          {/* Button wrapper for proper absolute positioning */}
          <div className="relative group">
            {/* Pulse ring */}
            <div className={`absolute inset-0 rounded-full bg-rose-500/30 animate-ping ${isOpen ? 'opacity-0' : 'opacity-100'}`} style={{ animationDuration: '2s' }} />

            {/* Button */}
            <motion.button
              onClick={toggleChat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
                isOpen
                  ? 'bg-gradient-to-br from-gray-600 to-gray-800 rotate-90'
                  : 'bg-gradient-to-br from-rose-600 to-[#800000] group-hover:from-rose-700 group-hover:to-[#5a0000]'
              }`}
              style={{
                boxShadow: isOpen
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                  : '0 10px 25px -5px rgba(128, 0, 0, 0.4), 0 4px 10px -5px rgba(128, 0, 0, 0.3)',
              }}
              aria-label={isOpen ? "Close chat" : "Open chat"}
            >
              {isOpen ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              )}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default React.memo(ChatbotWidget);
