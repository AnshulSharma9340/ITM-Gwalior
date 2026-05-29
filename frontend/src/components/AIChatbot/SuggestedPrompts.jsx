import React from 'react';

// Enhanced suggestions with icons
const DEFAULT_SUGGESTIONS = [
  { text: "What programs does ITM offer?", icon: "🎓" },
  { text: "How do I apply for B.Tech?", icon: "📝" },
  { text: "Show CSE department faculty", icon: "👨‍🏫" },
  { text: "Highest placement package?", icon: "💼" },
  { text: "Tell me about hostels", icon: "🏢" },
  { text: "How to access LMS portal?", icon: "💻" },
];

const PromptCard = ({ suggestion, onClick, index }) => (
  <button
    onClick={() => onClick(suggestion.text || suggestion)}
    className="group relative flex items-start gap-2 px-3 py-2.5 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm
      rounded-xl border border-rose-200/50 dark:border-gray-700/30 shadow-sm
      hover:shadow-md hover:border-[#800000] dark:hover:border-rose-500/50
      hover:bg-white/90 dark:hover:bg-gray-800/90
      hover:scale-[1.02] active:scale-[0.98]
      transition-all duration-200 text-left w-full h-full"
    style={{
      animationDelay: `${index * 80}ms`,
      animationFillMode: 'both',
    }}
  >
    {suggestion.icon && (
      <span className="text-sm shrink-0 mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
        {suggestion.icon}
      </span>
    )}
    <span className="text-[12px] leading-tight text-gray-700 dark:text-gray-300 group-hover:text-[#800000] dark:group-hover:text-rose-400 transition-colors font-medium">
      {suggestion.text || suggestion}
    </span>
  </button>
);

const SuggestedPrompts = ({ onSelect, suggestions = DEFAULT_SUGGESTIONS }) => {
  if (!suggestions || suggestions.length === 0) return null;

  // Map simple string suggestions to objects with generic icon if needed
  const normalizedSuggestions = suggestions.map(s => 
    typeof s === 'string' ? { text: s, icon: '💡' } : s
  );

  // Limit to 6 suggestions max for grid layout
  const displaySuggestions = normalizedSuggestions.slice(0, 6);

  return (
    <div className="px-4 py-3 border-t border-rose-100/50 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40">
      <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-[0.15em] flex items-center gap-2">
        <span className="w-3 h-px bg-gray-300 dark:bg-gray-600" />
        Suggested Questions
        <span className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
      </p>
      
      {/* 2-column grid instead of horizontal scroll for better discoverability */}
      <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {displaySuggestions.map((suggestion, index) => (
          <PromptCard
            key={index}
            suggestion={suggestion}
            index={index}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default React.memo(SuggestedPrompts);
