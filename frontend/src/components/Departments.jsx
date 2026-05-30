import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, Sparkles, Code2, Network, RadioTower, Building2,
  BookOpen, Brain, ShieldCheck, Cloud, BarChart3, Wifi, Rocket,
} from "lucide-react";

const DEPARTMENTS = [
  {
    name: "Computer Science & Engineering",
    short: "CSE",
    Icon: Code2,
    desc: "Innovators of the digital era. NBA-accredited curriculum, AI/ML labs, hackathon culture and unmatched placement record.",
    accent: "from-rose-500 to-[#800000]",
    badge: "NBA Accredited",
    path: "/cs",
    stats: ["240 seats", "9 labs", "Top 1%"],
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80",
  },
  {
    name: "Information Technology",
    short: "IT",
    Icon: Network,
    desc: "Full-stack developers, cloud architects and DevOps engineers. 565 hybrid terminals and AICTE-approved curriculum.",
    accent: "from-amber-500 to-orange-600",
    badge: "AICTE Approved",
    path: "/it",
    stats: ["120 seats", "Cloud lab", "RGPV"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80",
  },
  {
    name: "Electronics & Communication",
    short: "ECE",
    Icon: RadioTower,
    desc: "VLSI design, embedded systems, signals and wireless. Dedicated R&D labs running since 1997.",
    accent: "from-indigo-500 to-violet-700",
    badge: "VLSI Lab",
    path: "/ece",
    stats: ["60 seats", "Cadence", "Est. 1997"],
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80",
  },
  {
    name: "Civil Engineering",
    short: "CE",
    Icon: Building2,
    desc: "Building India's infrastructure — structural, geotech, transportation and sustainable construction.",
    accent: "from-yellow-600 to-amber-800",
    badge: "Est. 1997",
    path: "/ce",
    stats: ["30 seats", "BIM lab", "Govt jobs"],
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=900&q=80",
  },
  {
    name: "Central Library",
    short: "LIB",
    Icon: BookOpen,
    desc: "64,000+ print books, 50,000+ e-journals, IEEE, Springer access, dedicated reading and research spaces.",
    accent: "from-emerald-500 to-teal-700",
    badge: "Knowledge Hub",
    path: "/library",
    stats: ["64K books", "E-journals", "24×7 lab"],
    image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=900&q=80",
  },
];

const EMERGING = [
  { name: "AI & ML",           Icon: Brain,        path: "/aiml" },
  { name: "Cyber Security",    Icon: ShieldCheck,  path: "/cyber-security" },
  { name: "Cloud Computing",   Icon: Cloud,        path: "/cloud-computing" },
  { name: "Data Science",      Icon: BarChart3,    path: "/emerging-branches" },
  { name: "IoT",               Icon: Wifi,         path: "/emerging-branches" },
];

export default function Departments() {
  return (
    <section id="departments" data-section="departments" className="relative py-8 sm:py-20 md:py-28 bg-[#fbf7f2] dark:bg-[#020617] overflow-hidden">

      {/* Decorative blurs */}
      <div className="absolute top-20 right-0 w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-rose-200/40 to-transparent blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-16">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">
                Academic Excellence
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Explore our{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent">
                  Specialisations.
                </span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 -z-0 -skew-x-3"></span>
              </span>
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-md">
            World-class education across diverse disciplines designed to make you industry-ready
            from day one — pick the one that fits your ambition.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {DEPARTMENTS.map((d, i) => (
            <Link to={d.path} key={d.short}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-shadow h-full"
              >
                {/* Image header */}
                <div className="relative h-28 sm:h-44 overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${d.accent} mix-blend-multiply opacity-75`}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                  {/* Badge top-left — hidden on small phones to save space */}
                  <span className="hidden sm:inline-flex absolute top-4 left-4 items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur text-[9px] font-black uppercase tracking-widest text-[#800000] rounded-full shadow">
                    <Sparkles size={9} /> {d.badge}
                  </span>

                  {/* Icon top-right — soft glass chip with the lucide icon */}
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center justify-center w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur ring-1 ring-white/30 text-white shadow-lg">
                    <d.Icon size={16} strokeWidth={2.2} className="sm:!w-5 sm:!h-5" />
                  </div>

                  {/* Department code overlay */}
                  <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 text-white">
                    <div className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-white/70 mb-0.5 sm:mb-1">
                      Department
                    </div>
                    <div className="text-xl sm:text-3xl font-black tracking-[-0.04em] leading-none">{d.short}</div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-3 sm:p-6">
                  <h3 className="font-black text-sm sm:text-lg tracking-tight text-[#1a0606] dark:text-white mb-2 leading-snug group-hover:text-[#800000] transition-colors">
                    {d.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                    {d.desc}
                  </p>

                  {/* Stats pills */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-5">
                    {d.stats.map((s) => (
                      <span
                        key={s}
                        className="text-[8px] sm:text-[9px] uppercase tracking-widest font-black px-1.5 sm:px-2 py-0.5 sm:py-1 bg-rose-50 dark:bg-gray-800 text-[#800000] dark:text-rose-300 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-rose-50 dark:border-gray-800">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] group-hover:gap-3 inline-flex items-center gap-2 transition-all">
                      View
                      <span className="hidden sm:inline">Programme</span>
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-50 dark:bg-gray-800 group-hover:bg-[#800000] flex items-center justify-center text-[#800000] group-hover:text-white transition-colors">
                      <ArrowUpRight size={12} className="sm:!w-3.5 sm:!h-3.5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}

          {/* Emerging branches — special tile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: DEPARTMENTS.length * 0.07, duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white border border-rose-300/20 shadow-xl hover:shadow-2xl transition-shadow"
          >
            <div className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            ></div>
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/30 blur-3xl"></div>

            <div className="relative p-4 sm:p-7">
              <span className="inline-flex items-center gap-1.5 mb-3 sm:mb-5 px-2 sm:px-3 py-1 bg-amber-500/20 backdrop-blur border border-amber-300/30 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-amber-200">
                <Sparkles size={9} /> Future-Ready
              </span>

              <div className="mb-3 sm:mb-4 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-400/20 ring-1 ring-amber-300/40 text-amber-200 shadow-lg">
                <Rocket size={18} strokeWidth={2.2} className="sm:!w-6 sm:!h-6" />
              </div>

              <h3 className="font-black text-sm sm:text-xl tracking-tight mb-1.5 sm:mb-2">Emerging Branches</h3>
              <p className="text-[11px] sm:text-xs text-rose-100/70 leading-relaxed font-medium mb-3 sm:mb-5 line-clamp-2 sm:line-clamp-none">
                Future-ready B.Tech specialisations under the CSE umbrella.
              </p>

              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-6">
                {EMERGING.map((b) => (
                  <Link
                    key={b.name}
                    to={b.path}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black bg-white/10 backdrop-blur text-white border border-white/20 rounded-full hover:bg-white hover:text-[#800000] transition-colors"
                  >
                    <b.Icon size={10} strokeWidth={2.4} className="sm:!w-3 sm:!h-3" />
                    {b.name}
                  </Link>
                ))}
              </div>

              <Link
                to="/emerging-branches"
                className="inline-flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 hover:gap-3 transition-all"
              >
                Explore All <ArrowUpRight size={12} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
