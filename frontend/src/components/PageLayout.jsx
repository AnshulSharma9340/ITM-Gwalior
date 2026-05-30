import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import DepartmentSidebar from './DepartmentSidebar';
import EditableText from './admin/EditableText';

export default function PageLayout({
  name,
  shortName,
  badge,
  subtitle,
  chips = [],
  menuItems = [],
  activeTab,
  setActiveTab,
  children
}) {
  const pageKey = useLocation().pathname;
  // Normalize menuItems to get tab names for mobile scroll bar
  const tabNames = menuItems
    .filter(item => typeof item === 'string' ? true : !item.children)
    .map(item => typeof item === 'string' ? item : item.label);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] transition-colors duration-500 overflow-x-hidden">

      {/* ── HERO BANNER ──────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] pt-12 pb-20 md:pt-16 md:pb-24 overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 right-32 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-20 -left-10 w-96 h-96 rounded-full border border-white/50"></div>
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          {badge && (
            <span className="inline-block text-red-200 font-bold tracking-widest text-[10px] sm:text-xs uppercase mb-3 px-3 py-1 bg-white/10 rounded-full border border-white/20">
              <EditableText pageKey={pageKey} tkey="pl.badge" as="span" value={typeof badge === 'string' ? badge : ''}>
                {badge}
              </EditableText>
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter mb-3 leading-tight">
            {typeof name === 'string' ? (
              <EditableText pageKey={pageKey} tkey="pl.title" as="span" value={name}>{name}</EditableText>
            ) : name}
          </h1>

          <p className="text-red-100/80 max-w-xl text-xs sm:text-sm leading-relaxed font-medium">
            <EditableText pageKey={pageKey} tkey="pl.subtitle" as="span" multiline value={typeof subtitle === 'string' ? subtitle : ''}>
              {subtitle}
            </EditableText>
          </p>

          {/* Quick-stat chips */}
          {chips.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {chips.map(([icon, label]) => (
                <div key={label} className="flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/20 text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold">
                  <span>{icon}</span> {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-16 md:pb-24">

        {/* ── MOBILE TAB BAR (hidden on lg+) ───────────────────── */}
        {tabNames.length > 0 && (
          <div className="lg:hidden bg-gray-50 dark:bg-gray-900 py-3 -mx-3 px-3 sm:-mx-6 sm:px-6">
            <div className="flex overflow-x-auto gap-2 pb-1 snap-x" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {tabNames.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`shrink-0 snap-start px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-[#800000] text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#800000] hover:text-[#800000]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={`grid ${tabNames.length > 0 ? 'lg:grid-cols-4' : 'grid-cols-1'} gap-6 lg:gap-8 items-start`}>

          {/* ── SIDEBAR (desktop only) ────────────────────────── */}
          {tabNames.length > 0 && (
            <aside className="hidden lg:block lg:col-span-1">
              <DepartmentSidebar 
                menuItems={menuItems} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
              />
            </aside>
          )}

          {/* ── MAIN CONTENT ─────────────────────────────────── */}
          <main className={`${tabNames.length > 0 ? 'lg:col-span-3' : ''} space-y-6 md:space-y-8 min-w-0 w-full overflow-hidden`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

        </div>
      </div>
    </div>
  );
}
