import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-2.5 px-4 py-1.5">
      <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-rose-600 to-[#800000] flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-900/20 ring-2 ring-rose-200/50">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="8.5" />
          <circle cx="9" cy="10" r="1.5" fill="currentColor" />
          <circle cx="15" cy="10" r="1.5" fill="currentColor" />
          <path d="M8 15c1.5 1.5 4.5 1.5 6 0" strokeLinecap="round" />
        </svg>
        {/* Shimmer pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-rose-400/20" style={{ animationDuration: '2s' }} />
      </div>
      <div className="bg-white dark:bg-gray-800/90 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-rose-100/80 dark:border-gray-700/40">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1 items-center">
            <span
              className="w-2 h-2 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '0.8s' }}
            />
            <span
              className="w-2 h-2 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '0.8s' }}
            />
            <span
              className="w-2 h-2 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '0.8s' }}
            />
          </div>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wide animate-pulse">
            Thinking...
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TypingIndicator);
