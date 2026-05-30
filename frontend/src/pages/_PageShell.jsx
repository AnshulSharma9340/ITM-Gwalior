import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";

/** Shared hero + main wrapper used by every internal content page. */
export default function PageShell({ eyebrow, title, accentTitle, intro, chips = [], children }) {
  // Hero text is editable in admin edit mode, scoped to the current route.
  const pageKey = useLocation().pathname;
  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617] transition-colors duration-500">
      {/* HERO */}
      <section data-section="shell_hero" className="relative bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] pt-8 pb-10 sm:pt-14 sm:pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Decorative ornaments */}
        <div aria-hidden className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 right-32 w-72 h-72 rounded-full border-2 border-white" />
          <div className="absolute -bottom-20 -left-10 w-96 h-96 rounded-full border border-white/50" />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/20" />
        </div>
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/70 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {eyebrow && (
            <motion.span
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black tracking-[0.3em] uppercase text-amber-200 mb-2 sm:mb-4 px-2 py-0.5 sm:px-3 sm:py-1 bg-white/10 backdrop-blur rounded-full border border-amber-300/30">
              <EditableText pageKey={pageKey} tkey="shell.eyebrow" value={eyebrow} as="span">{eyebrow}</EditableText>
            </motion.span>
          )}
          <motion.h1
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter mb-2 sm:mb-4 leading-[1.05]">
            <EditableText pageKey={pageKey} tkey="shell.title" value={title} as="span">{title}</EditableText>{" "}
            {accentTitle && (
              <EditableText pageKey={pageKey} tkey="shell.accent" value={accentTitle} as="span"
                className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent">
                {accentTitle}
              </EditableText>
            )}
          </motion.h1>
          {intro && (
            <motion.p
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-rose-100/85 max-w-2xl text-xs sm:text-sm md:text-base font-medium leading-relaxed line-clamp-3 sm:line-clamp-none">
              <EditableText pageKey={pageKey} tkey="shell.intro" value={intro} as="span" multiline>{intro}</EditableText>
            </motion.p>
          )}
          {chips.length > 0 && (
            <div className="mt-3 sm:mt-6 flex flex-wrap gap-1.5 sm:gap-2">
              {chips.map((c) => (
                <span key={c} className="bg-white/10 backdrop-blur border border-white/20 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 md:py-20 space-y-8 sm:space-y-12 md:space-y-16">
        {children}
      </main>
    </div>
  );
}

/* Smaller reusable building blocks used across every page.
   Pass `tkey` to make a SectionTitle's text editable in admin edit mode. */
export function SectionTitle({ eyebrow, title, accent, tkey }) {
  const pageKey = useLocation().pathname;
  const editable = (key, value, props = {}) =>
    tkey ? (
      <EditableText pageKey={pageKey} tkey={`${tkey}.${key}`} value={value} as="span" {...props}>
        {value}
      </EditableText>
    ) : (
      value
    );
  return (
    <div className="mb-5 sm:mb-8">
      {eyebrow && (
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000] dark:text-amber-300">
            {editable("eyebrow", eyebrow)}
          </span>
        </div>
      )}
      <h2 className="text-xl sm:text-2xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-tight">
        {editable("title", title)}{" "}
        {accent &&
          editable("accent", accent, {
            className: "bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent",
          })}
      </h2>
    </div>
  );
}

export function Prose({ children }) {
  return (
    <div className="prose-base text-gray-700 dark:text-gray-300 leading-relaxed space-y-4 text-[15px] font-medium max-w-3xl">
      {children}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm p-3 sm:p-6 md:p-7 ${className}`}>
      {children}
    </div>
  );
}

export function FactRow({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-rose-50 dark:border-gray-800 p-2.5 sm:p-4">
          <div className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-[#800000] to-amber-600 bg-clip-text text-transparent leading-none">{it.num}</div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400 mt-1">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
