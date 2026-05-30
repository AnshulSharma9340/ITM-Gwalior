import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { Award, Trophy, Sparkles } from "lucide-react";
import { DISTINCTIVENESS, ACHIEVEMENTS } from "../data/itm_data";
import EditableText from "./admin/EditableText";

export default function Distinctiveness() {
  const pageKey = useLocation().pathname;
  return (
    <section data-section="distinctiveness" className="relative py-6 sm:py-20 md:py-28 bg-[#fbf7f2] dark:bg-[#020617] overflow-hidden">

      {/* Background ornaments */}
      <div className="absolute top-20 right-0 w-[25vw] h-[25vw] rounded-full bg-gradient-to-bl from-rose-200/40 to-transparent blur-2xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-14">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <EditableText pageKey={pageKey} tkey="distinct.eyebrow" as="span" value="Where Art Meets Engineering"
              className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">
              Where Art Meets Engineering
            </EditableText>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05] mb-3 sm:mb-5">
            <EditableText pageKey={pageKey} tkey="distinct.title.line1" as="span" value="What makes ITM">What makes ITM</EditableText>{" "}
            <span className="relative inline-block">
              <EditableText pageKey={pageKey} tkey="distinct.title.line2" as="span" value="truly distinctive."
                className="relative z-10 bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent">
                truly distinctive.
              </EditableText>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 -z-0 -skew-x-3"></span>
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            <EditableText pageKey={pageKey} tkey="distinct.intro" as="span" multiline value={DISTINCTIVENESS.intro}>
              {DISTINCTIVENESS.intro}
            </EditableText>
          </p>
        </div>

        {/* Cultural pillars grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 mb-10 sm:mb-20">
          {DISTINCTIVENESS.pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-shadow p-3 sm:p-6"
            >
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-700"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#800000] to-[#3e0202] text-amber-200 ring-1 ring-amber-300/30 shadow-md">
                    <p.Icon size={22} strokeWidth={2.1} />
                  </div>
                  {p.since && (
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                      {p.since}
                    </span>
                  )}
                </div>

                <h3 className="font-black text-sm sm:text-lg tracking-tight text-[#1a0606] dark:text-white leading-snug mb-1.5 sm:mb-2">
                  {p.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {p.body}
                </p>

                <div className="mt-4 h-px w-8 bg-gradient-to-r from-[#800000] to-amber-400 group-hover:w-full transition-all duration-700"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Achievements timeline ─────────────────────────────── */}
        <div className="relative">
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-gray-700 mb-3">
              <Trophy size={12} className="text-amber-700 dark:text-amber-400" />
              <EditableText pageKey={pageKey} tkey="distinct.recog.eyebrow" as="span" value="Recent Recognitions"
                className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700 dark:text-amber-400">
                Recent Recognitions
              </EditableText>
            </div>
            <h3 className="text-lg sm:text-2xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white">
              <EditableText pageKey={pageKey} tkey="distinct.recog.title" as="span" value="Awards & honours that prove it.">
                Awards &amp; honours that prove it.
              </EditableText>
            </h3>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {ACHIEVEMENTS.map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-gray-900 rounded-xl sm:rounded-2xl border border-amber-100 dark:border-gray-800 p-3 sm:p-5 hover:shadow-xl transition-shadow"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-300/20 to-transparent rounded-bl-full"></div>

                <div className="relative">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <Award size={16} className="text-amber-600" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                      {a.year}
                    </span>
                  </div>
                  <h4 className="font-black text-xs sm:text-sm tracking-tight text-[#1a0606] dark:text-white leading-snug mb-1.5 sm:mb-2">
                    {a.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {a.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
