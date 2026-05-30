import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, GraduationCap, ArrowUpRight } from "lucide-react";
import { usePublicRecruiters } from "../hooks/usePublicTap";

const FALLBACK_CATEGORIES = [
  { id: "eng_it",     label: "Engineering & IT", short: "Engg / IT", folder: "Engineering_Computer_Applications", count: 39, accent: "from-rose-500 to-[#800000]" },
  { id: "management", label: "Management",       short: "MBA",       folder: "Management",                        count: 37, accent: "from-amber-500 to-orange-600" },
];
const ACCENT_BY_KEY = {
  eng_it: "from-rose-500 to-[#800000]",
  management: "from-amber-500 to-orange-600",
};
const ICON_BY_KEY = { eng_it: Briefcase, management: GraduationCap };

function LogoCard({ src, name }) {
  if (!src) {
    return (
      <div className="group relative shrink-0 w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-slate-700/60 rounded-xl sm:rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
        <span className="text-[10px] sm:text-xs font-black text-gray-500 dark:text-gray-300 px-2 text-center">{name}</span>
      </div>
    );
  }
  return (
    <div className="group relative shrink-0 w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-slate-700/60 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <img
        src={src}
        alt={name}
        loading="lazy"
        onError={(e) => (e.target.style.display = "none")}
        className="w-full h-full object-contain p-2 sm:p-3 md:p-4 grayscale group-hover:grayscale-0 dark:grayscale-0 dark:brightness-150 dark:contrast-[0.9] transition-all duration-300"
      />
    </div>
  );
}

export default function RecruiterMarquee() {
  const { data } = usePublicRecruiters();

  // Build categories from API data; fallback to bundled list
  const categories = useMemo(() => {
    if (data?.categories?.length) {
      return data.categories.map((c, i) => ({
        id: c.key,
        label: c.name,
        short: c.name.split(/[&·]|and/i)[0].trim(),
        icon: ICON_BY_KEY[c.key] || Briefcase,
        accent: ACCENT_BY_KEY[c.key] || FALLBACK_CATEGORIES[i % 2].accent,
        recruiters: c.recruiters,
        count: c.recruiters.length,
        useFallbackFolder: null,
      }));
    }
    return FALLBACK_CATEGORIES.map((c) => ({
      ...c,
      icon: ICON_BY_KEY[c.id] || Briefcase,
      recruiters: Array.from({ length: c.count }, (_, i) => ({
        name: `Recruiter ${i + 1}`,
        logo: `/images/company_logos/${c.folder}/logo_${i}.png`,
      })),
      useFallbackFolder: c.folder,
    }));
  }, [data]);

  const [activeId, setActiveId] = useState(categories[0]?.id);
  const active = categories.find((c) => c.id === activeId) || categories[0];
  if (!active) return null;

  const half = Math.ceil(active.recruiters.length / 2);
  const row1 = active.recruiters.slice(0, half);
  const row2 = active.recruiters.slice(half);
  const loop = (arr) => [...arr, ...arr];

  return (
    <section data-section="recruiters" className="relative py-6 sm:py-16 md:py-20 bg-white dark:bg-[#020617] overflow-hidden border-y border-rose-100/60 dark:border-white/5">

      <div className="absolute inset-y-0 left-0 w-24 md:w-44 bg-gradient-to-r from-white dark:from-[#020617] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-24 md:w-44 bg-gradient-to-l from-white dark:from-[#020617] to-transparent z-10 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-4 sm:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Top Recruiters</span>
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Where our students{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent">go to work.</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 dark:bg-amber-900/30 -z-0 -skew-x-3"></span>
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed mt-2 sm:mt-3">
              {active.count}+ partners actively recruiting across {active.label.toLowerCase()}. Click a category to switch.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                  activeId === c.id ? "text-white shadow-lg" : "text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {activeId === c.id && (
                  <motion.span layoutId="rec-tab" className={`absolute inset-0 bg-gradient-to-r ${c.accent} rounded-full`} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <c.icon size={11} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">{c.label}</span>
                <span className="relative z-10 sm:hidden">{c.short}</span>
                <span className="relative z-10 ml-1 px-1.5 py-0.5 bg-white/30 backdrop-blur rounded-full text-[8px]">{c.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 sm:mb-8 flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
          <span className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${active.accent} text-white inline-flex items-center gap-1.5`}>
            <active.icon size={11} /> {active.label}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-rose-50 dark:bg-gray-800 text-[#800000] dark:text-rose-400">
            {active.count} verified recruiters
          </span>
          <span className="text-gray-400">· hover any logo to highlight</span>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <div className="flex overflow-hidden group">
          <div key={`row1-${activeId}`} className="flex gap-2 sm:gap-3 md:gap-4 animate-[marquee-left_50s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap">
            {loop(row1).map((r, k) => <LogoCard key={`r1-${k}`} src={r.logo} name={r.name} />)}
          </div>
        </div>

        <div className="flex overflow-hidden group">
          <div key={`row2-${activeId}`} className="flex gap-3 md:gap-4 animate-[marquee-right_55s_linear_infinite] group-hover:[animation-play-state:paused] whitespace-nowrap">
            {loop(row2).map((r, k) => <LogoCard key={`r2-${k}`} src={r.logo} name={r.name} />)}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 mt-10 text-center">
        <p className="inline-flex items-center gap-2 text-xs text-gray-500 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Active campus drives going on right now ·
          <a href="/tap" className="text-[#800000] font-black hover:underline inline-flex items-center gap-1">
            View placement records <ArrowUpRight size={11} />
          </a>
        </p>
      </div>

      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  );
}
