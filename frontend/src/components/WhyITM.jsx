import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Microscope,
  Briefcase,
  Globe2,
  HandCoins,
  Cpu,
} from "lucide-react";
import EditableText from "./admin/EditableText";

// Real recognitions/awards scraped from itmgoi.in
const REASONS = [
  {
    icon: ShieldCheck,
    title: "NAAC A — CGPA 3.01",
    body: "Accredited with CGPA 3.01 (A grade), valid till 24 November 2030. AICTE-approved with NBA-accredited programmes.",
    accent: "from-rose-500 to-[#800000]",
  },
  {
    icon: Briefcase,
    title: "Microsoft Learn — Center of Excellence",
    body: "Recognised as a Microsoft Learn Center of Excellence (May 2024 – April 2025). Tech-first curriculum, certifications and labs.",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: Microscope,
    title: "World Book of Records, London",
    body: "Honoured in 2024 for delivering Five Lakh Internships in Three Years. Internship-first model from day one.",
    accent: "from-emerald-500 to-teal-700",
  },
  {
    icon: HandCoins,
    title: "EduSkills #35 All-India",
    body: "Ranked #35 nationally in the EduSkills Virtual Internship Rankings 2024 — Engineering category.",
    accent: "from-sky-500 to-blue-700",
  },
  {
    icon: Globe2,
    title: "Honeywell & ICT Academy CoE",
    body: "Centre of Excellence for Women Empowerment (2025), in partnership with Honeywell and ICT Academy.",
    accent: "from-violet-500 to-indigo-700",
  },
  {
    icon: Cpu,
    title: "Best Institute — Training & Placement",
    body: "Indian Education Excellence Awards 2022 winner for Training & Placement. Ranked 5th in Central India (Silicon India).",
    accent: "from-pink-500 to-rose-700",
  },
];

export default function WhyITM() {
  const pageKey = useLocation().pathname;
  return (
    <section data-section="why_itm" className="relative py-8 sm:py-20 md:py-28 bg-[#1a0606] text-white overflow-hidden">

      {/* Background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        ></div>
      </div>
      <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-gradient-to-br from-[#800000]/30 to-transparent blur-2xl rounded-full pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-5">
            <EditableText
              pageKey={pageKey}
              tkey="whyitm.eyebrow"
              as="span"
              value="Why ITM Gwalior"
              className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-300"
            >
              Why ITM Gwalior
            </EditableText>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-4">
            <EditableText pageKey={pageKey} tkey="whyitm.title.line1" as="span" value="Six reasons students">
              Six reasons students
            </EditableText>{" "}
            <br className="hidden md:block" />
            <EditableText
              pageKey={pageKey}
              tkey="whyitm.title.line2"
              as="span"
              value="pick us over the rest."
              className="bg-gradient-to-r from-amber-300 to-rose-300 bg-clip-text text-transparent"
            >
              pick us over the rest.
            </EditableText>
          </h2>
          <p className="text-sm md:text-base text-rose-100/70 font-medium leading-relaxed">
            <EditableText
              pageKey={pageKey}
              tkey="whyitm.intro"
              as="span"
              multiline
              value="Quality you can measure. Outcomes you can verify. A campus that takes your future as seriously as you do."
            >
              Quality you can measure. Outcomes you can verify. A campus that takes your future as seriously as you do.
            </EditableText>
          </p>
        </div>

        {/* Equal-cell grid — 1 col on mobile, 2 on tablet, 3 on desktop. auto-rows-fr keeps every row the same height. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 auto-rows-fr">
          {REASONS.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group relative h-full flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur border border-white/10 p-4 sm:p-7"
            >
              {/* Hover glow */}
              <div
                className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${r.accent} opacity-0 group-hover:opacity-25 blur-2xl transition-opacity duration-500`}
              ></div>

              <div className="relative flex flex-col h-full">
                <div
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${r.accent} flex items-center justify-center shadow-lg mb-3 sm:mb-5`}
                >
                  <r.icon size={18} className="sm:!w-5 sm:!h-5" />
                </div>

                <h3 className="text-sm sm:text-lg md:text-xl font-black tracking-tight leading-tight mb-2 sm:mb-3">
                  <EditableText
                    pageKey={pageKey}
                    tkey={`whyitm.reasons.${i}.title`}
                    as="span"
                    value={r.title}
                  >
                    {r.title}
                  </EditableText>
                </h3>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-medium">
                  <EditableText
                    pageKey={pageKey}
                    tkey={`whyitm.reasons.${i}.body`}
                    as="span"
                    multiline
                    value={r.body}
                  >
                    {r.body}
                  </EditableText>
                </p>

                {/* Pinned to the bottom of every card so the "Learn more" baseline is identical across all six. */}
                <div className="mt-auto pt-4 sm:pt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300/0 group-hover:text-amber-300 transition-colors">
                  <span className="w-6 h-px bg-amber-300"></span>
                  Learn more
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
