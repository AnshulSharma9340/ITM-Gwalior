import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Rahul Sharma",
    role: "SDE @ Google",
    batch: "B.Tech CSE · 2022",
    text: "ITM was the perfect launchpad. The faculty, hackathons and industry exposure prepared me to crack the Google interview on the first attempt.",
    initials: "RS",
    accent: "from-rose-500 to-[#800000]",
  },
  {
    name: "Priya Verma",
    role: "Lead Architect, TCS",
    batch: "B.Tech IT · 2018",
    text: "The studio culture at ITM helped me find my design language. Mentor faculty, 565 terminals and a coding club that genuinely shipped — it shows in my work today.",
    initials: "PV",
    accent: "from-amber-500 to-orange-600",
  },
  {
    name: "Ankit Joshi",
    role: "Founder, FinTech Startup",
    batch: "MBA · 2020",
    text: "What I learnt about leadership and customer empathy at ITM Gwalior is the bedrock of my company. Worth every rupee of tuition.",
    initials: "AJ",
    accent: "from-emerald-500 to-teal-700",
  },
  {
    name: "Neha Khanna",
    role: "Data Scientist, Microsoft",
    batch: "B.Tech CSE-AIML · 2024",
    text: "The AI/ML labs gave me access to GPUs and datasets I'd otherwise only read about. My capstone became a published paper and a job offer.",
    initials: "NK",
    accent: "from-indigo-500 to-violet-700",
  },
  {
    name: "Suyash Tomar",
    role: "Site Engineer, L&T",
    batch: "B.Tech Civil · 2021",
    text: "Site visits, structural design labs and on-the-job training — I walked into L&T already knowing how things actually get built.",
    initials: "ST",
    accent: "from-yellow-600 to-amber-800",
  },
];

export default function Testimonials() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const next = () => setIdx((i) => (i + 1) % TESTIMONIALS.length);
  const prev = () => setIdx((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  const t = TESTIMONIALS[idx];

  return (
    <section data-section="testimonials" className="relative py-6 sm:py-20 md:py-28 bg-gradient-to-br from-[#fbf7f2] via-rose-50/30 to-white dark:from-[#020617] dark:to-[#020617] overflow-hidden">

      <div className="absolute top-0 right-0 w-[25vw] h-[25vw] rounded-full bg-gradient-to-bl from-rose-200/40 to-transparent blur-2xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">
                Alumni Success
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              The ITM{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent">
                  Experience.
                </span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 -z-0 -skew-x-3"></span>
              </span>
            </h2>
          </div>

          {/* Carousel nav */}
          <div className="flex items-center gap-3">
            <button
              onClick={prev}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-[#800000] hover:text-white hover:border-[#800000] text-[#800000] flex items-center justify-center transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
              {String(idx + 1).padStart(2, "0")} <span className="text-gray-300">/</span> {String(TESTIMONIALS.length).padStart(2, "0")}
            </span>
            <button
              onClick={next}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-[#800000] hover:text-white hover:border-[#800000] text-[#800000] flex items-center justify-center transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Featured testimonial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={t.name}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl p-4 sm:p-8 md:p-12"
              >
                <div className={`absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br ${t.accent} opacity-10 blur-3xl pointer-events-none`}></div>
                <Quote size={72} className="absolute top-6 right-6 text-rose-100 -scale-x-100" />

                <div className="relative">
                  <div className="flex items-center gap-1 mb-4 sm:mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" className="text-amber-500" />
                    ))}
                  </div>

                  <p className="text-sm sm:text-base md:text-2xl text-gray-800 dark:text-gray-100 leading-relaxed font-medium mb-5 sm:mb-8 italic">
                    &ldquo;{t.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-rose-50 dark:border-gray-800">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${t.accent} text-white flex items-center justify-center text-xs sm:text-base font-black tracking-tight shadow-lg`}>
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base tracking-tight text-[#1a0606] dark:text-white">
                        {t.name}
                      </h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#800000] mt-0.5">
                        {t.role}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-0.5">
                        {t.batch}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Side list — clickable mini cards */}
          <div className="space-y-2 sm:space-y-3">
            {TESTIMONIALS.map((tt, i) => (
              <button
                key={tt.name}
                onClick={() => setIdx(i)}
                className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  i === idx
                    ? "bg-white dark:bg-gray-900 border-[#800000] shadow-lg"
                    : "bg-white/50 dark:bg-gray-900/50 border-transparent hover:border-rose-200"
                }`}
              >
                <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${tt.accent} text-white flex items-center justify-center text-[10px] sm:text-xs font-black tracking-tight`}>
                  {tt.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black tracking-tight text-[#1a0606] dark:text-white truncate">
                    {tt.name}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 truncate">
                    {tt.role}
                  </div>
                </div>
                {i === idx && (
                  <motion.div layoutId="testi-dot" className="ml-auto w-2 h-2 rounded-full bg-[#800000]"></motion.div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
