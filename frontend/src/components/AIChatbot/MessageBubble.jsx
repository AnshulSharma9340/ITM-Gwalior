import React, { memo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const UserAvatar = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-200/50">
    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
);

const AIVatar = () => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-600 to-[#800000] flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-900/20 ring-2 ring-rose-200/50 p-1">
    <svg className="w-full h-full text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
);

const CodeBlock = ({ language, value }) => (
  <div className="relative group my-4 overflow-hidden rounded-xl shadow-md">
    <div className="absolute top-0 right-0 px-3 py-1.5 text-[11px] text-gray-400 bg-gray-900/90 rounded-bl-lg font-mono border-l border-b border-gray-700/50 z-10">
      {language || 'code'}
    </div>
    <SyntaxHighlighter
      style={oneDark}
      language={language || 'text'}
      PreTag="div"
      customStyle={{
        margin: 0,
        borderRadius: '0.75rem',
        padding: '1.25rem',
        paddingTop: '1.25rem',
        fontSize: '0.875rem',
        lineHeight: '1.6',
      }}
      showLineNumbers={false}
    >
      {value}
    </SyntaxHighlighter>
    <button
      onClick={() => navigator.clipboard.writeText(value)}
      className="absolute bottom-3 right-3 px-2.5 py-1.5 text-[11px] text-gray-300 bg-gray-800 hover:bg-gray-700 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all font-medium border border-gray-600 active:scale-95"
    >
      Copy Code
    </button>
  </div>
);

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const AnimatedEntry = ({ children, index }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="transition-all duration-300 ease-out"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transitionDelay: `${index * 20}ms`,
      }}
    >
      {children}
    </div>
  );
};

const MessageBubble = ({ message, index = 0 }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const [timestamp] = useState(formatTime);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatedEntry index={index}>
      <div className={`flex items-start gap-3 px-4 py-2 ${isUser ? 'flex-row-reverse' : ''}`}>
        {isUser ? <UserAvatar /> : <AIVatar />}

        <div className={`relative group max-w-[88%] md:max-w-[80%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div
            className={`rounded-2xl px-4 py-3 shadow-md ${
              isUser
                ? 'bg-gradient-to-br from-rose-600 to-[#800000] text-white rounded-tr-sm shadow-rose-900/20'
                : isError 
                  ? 'bg-red-50 dark:bg-red-900/20 rounded-tl-sm shadow-sm border border-red-200 dark:border-red-800/50 text-red-800 dark:text-red-200'
                  : 'bg-white dark:bg-gray-800/95 rounded-tl-sm shadow-sm border border-rose-100/80 dark:border-gray-700/50 text-gray-800 dark:text-gray-200'
            }`}
          >
            {isUser ? (
              <p className="text-[13px] sm:text-[14px] leading-relaxed font-medium tracking-wide whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none text-[14px]
                prose-p:my-1.5 prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-headings:font-semibold prose-headings:mt-4 prose-headings:mb-2
                h1:text-lg h2:text-base h3:text-[15px]
                prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-bold
                prose-a:text-[#800000] dark:prose-a:text-rose-400 prose-a:font-medium prose-a:underline hover:prose-a:text-rose-600
                prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-rose-50 dark:prose-code:bg-gray-700 prose-code:text-[13px] prose-code:font-medium prose-code:text-rose-900 dark:prose-code:text-rose-200
                prose-pre:bg-transparent prose-pre:p-0
                prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
                prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
                prose-li:my-1 prose-li:text-[14px]
                prose-hr:my-3 prose-hr:border-rose-100 dark:prose-hr:border-gray-700
                prose-blockquote:border-l-[3px] prose-blockquote:border-[#800000] dark:prose-blockquote:border-rose-500 prose-blockquote:bg-rose-50/50 dark:prose-blockquote:bg-gray-800/50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-blockquote:text-[14px] prose-blockquote:italic"
              >
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const value = String(children).replace(/\n$/, '');

                      if (!inline && match) {
                        return <CodeBlock language={match[1]} value={value} />;
                      }

                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    pre({ children }) {
                      return <>{children}</>;
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {/* Metadata Row: Time and Actions */}
          <div className={`flex items-center gap-3 mt-1.5 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
            <p className={`text-[10px] font-medium tracking-wide ${isUser ? 'text-gray-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {timestamp}
            </p>
            
            {!isUser && !isError && message.content && (
              <button 
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] text-gray-400 hover:text-[#800000] dark:hover:text-rose-400 focus:opacity-100"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-500">Copied</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>
    </AnimatedEntry>
  );
};

export default memo(MessageBubble);
