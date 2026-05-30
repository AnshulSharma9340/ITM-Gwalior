import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Quote, Target, Compass, Heart, ChevronRight, Sparkles } from "lucide-react";
import { DIRECTOR, VISION, MISSION, CORE_VALUES } from "../data/itm_data";
import EditableText from "./admin/EditableText";

const TABS = [
  { id: "vision", label: "Vision", icon: Compass },
  { id: "mission", label: "Mission", icon: Target },
  { id: "values", label: "Core Values", icon: Heart },
];

export default function DirectorVision() {
  const pageKey = useLocation().pathname;
  const [tab, setTab] = useState("vision");
  const [messageExpanded, setMessageExpanded] = useState(false);

  return (
    <section data-section="director_vision" className="relative py-6 sm:py-20 md:py-28 bg-gradient-to-b from-white via-rose-50/30 to-white dark:from-[#020617] dark:to-[#020617] overflow-hidden">
      <div className="absolute top-0 left-0 w-[25vw] h-[25vw] rounded-full bg-gradient-to-br from-rose-200/40 to-transparent blur-2xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-14">
          <div className="inline-flex items-center gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <EditableText
              pageKey={pageKey}
              tkey="director.eyebrow"
              as="span"
              value="The ITM Way"
              className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]"
            >
              The ITM Way
            </EditableText>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            <EditableText pageKey={pageKey} tkey="director.title.line1" as="span" value="A message from our">
              A message from our
            </EditableText>{" "}
            <EditableText
              pageKey={pageKey}
              tkey="director.title.line2"
              as="span"
              value="Director."
              className="bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent"
            >
              Director.
            </EditableText>
          </h2>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-8">

          {/* LEFT — Director's message */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-rose-50 dark:border-gray-800">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#800000] via-amber-500 to-[#800000]"></div>

              {/* Decorative quote watermark */}
              <Quote
                size={140}
                className="absolute -top-4 right-4 text-rose-50 dark:text-gray-800 -scale-x-100 pointer-events-none"
              />

              <div className="relative p-4 sm:p-8 md:p-10">
                <div className="flex items-center gap-3 sm:gap-5 mb-4 sm:mb-7 pb-4 sm:pb-7 border-b border-rose-50 dark:border-gray-800">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#800000] via-[#9b1c1c] to-[#3e0202] flex items-center justify-center text-white font-black text-base sm:text-2xl tracking-tight shadow-xl">
                      MM
                    </div>
                    <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg">
                      <Sparkles size={10} className="sm:!w-3 sm:!h-3" />
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] mb-0.5 sm:mb-1">
                      From the Director&apos;s Desk
                    </div>
                    <h3 className="text-sm sm:text-xl md:text-2xl font-black tracking-tight text-[#1a0606] dark:text-white leading-tight">
                      {DIRECTOR.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-bold mt-0.5">{DIRECTOR.designation}</p>
                  </div>
                </div>

                <div
                  className={`relative space-y-3 sm:space-y-4 text-[13px] sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium overflow-hidden transition-[max-height] duration-300 ${
                    messageExpanded ? "max-h-[2000px]" : "max-h-[180px] sm:max-h-none"
                  }`}
                >
                  {DIRECTOR.message.map((para, i) => (
                    <p key={i} className={i === 0 ? "text-sm sm:text-base md:text-lg italic text-gray-800 dark:text-gray-200" : ""}>
                      {para}
                    </p>
                  ))}
                  {!messageExpanded && (
                    <div className="sm:hidden absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setMessageExpanded((v) => !v)}
                  className="sm:hidden mt-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] dark:text-rose-300 hover:gap-2 transition-all"
                >
                  {messageExpanded ? "Show less" : "Read full message"}
                  <ChevronRight size={12} className={`transition-transform ${messageExpanded ? "rotate-90" : ""}`} />
                </button>

                <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-rose-50 dark:border-gray-800 flex flex-wrap gap-1.5 sm:gap-2">
                  {["ABCAS Assessment", "Project-based Learning", "Unnat Bharat Abhiyan", "PMKVY"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] sm:text-[10px] uppercase tracking-widest font-black px-2 sm:px-3 py-1 sm:py-1.5 bg-rose-50 dark:bg-gray-800 text-[#800000] dark:text-rose-300 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Vision/Mission/Values tabs */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-5"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-rose-300/10 h-full lg:min-h-[520px]">

              {/* Background pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              ></div>
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/30 blur-3xl"></div>

              <div className="relative p-4 sm:p-8 md:p-10">

                {/* Tab pills */}
                <div className="flex gap-1 sm:gap-1.5 mb-4 sm:mb-8 bg-white/10 backdrop-blur p-1 sm:p-1.5 rounded-full">
                  {TABS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`relative flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-2.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-colors ${
                        tab === t.id ? "text-[#800000]" : "text-white/70 hover:text-white"
                      }`}
                    >
                      {tab === t.id && (
                        <motion.span
                          layoutId="dv-tab"
                          className="absolute inset-0 bg-amber-300 rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        ></motion.span>
                      )}
                      <t.icon size={12} className="relative" />
                      <span className="relative">{t.label}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {tab === "vision" && (
                    <motion.div
                      key="vision"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300 mb-3">
                        Our Vision
                      </div>
                      <p className="text-sm sm:text-base md:text-lg leading-relaxed font-medium text-white/95 italic">
                        &ldquo;{VISION}&rdquo;
                      </p>
                    </motion.div>
                  )}

                  {tab === "mission" && (
                    <motion.div
                      key="mission"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300 mb-4">
                        Our Mission
                      </div>
                      <ul className="space-y-2.5 sm:space-y-4">
                        {MISSION.map((m, i) => (
                          <li key={i} className="flex items-start gap-2 sm:gap-3 text-[13px] sm:text-sm md:text-base text-white/95 leading-relaxed font-medium">
                            <span className="flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-md sm:rounded-lg bg-amber-300 text-[#800000] font-black shrink-0 text-[10px] sm:text-xs">
                              {i + 1}
                            </span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {tab === "values" && (
                    <motion.div
                      key="values"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-2 sm:space-y-3 max-h-[200px] sm:max-h-[400px] overflow-y-auto pr-2"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300 mb-2">
                        Core Values
                      </div>
                      {CORE_VALUES.map((v) => (
                        <div key={v.title} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                            <ChevronRight size={11} className="text-amber-300" />
                            <h4 className="font-black text-xs sm:text-sm tracking-tight">{v.title}</h4>
                          </div>
                          <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-medium pl-4 sm:pl-5">
                            {v.body}
                          </p>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
