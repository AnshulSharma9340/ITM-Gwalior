import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  Microscope,
  Rocket,
  BookOpen,
  Award,
  Users,
  Calendar,
  ArrowRight,
  ExternalLink,
  ArrowUpRight,
  FileText,
  Mail,
  Phone,
} from "lucide-react";

const HUB_LINKS = [
  {
    title: "Research & Development Cell",
    subtitle: "R&D · IPR · Funded Projects",
    body: "Vision, focus areas across 11 domains, departmental research, downloadable publications archive (2019–2025) and IPR list 2019–2024.",
    path: "/research/rd-cell",
    icon: Microscope,
    accent: "from-rose-500 to-[#800000]",
    stats: ["6 yrs publications", "11 focus areas", "IPR 2019-24"],
  },
  {
    title: "Innovation Ecosystem",
    subtitle: "IDEAPAD · IIC 8.0 · NISP · EDC",
    body: "Campus incubator established 2021, Innovation Council leadership for 2025-26, NISP Steering Committee, Entrepreneurship Development Cell.",
    path: "/research/innovation-ecosystem",
    icon: Rocket,
    accent: "from-amber-500 to-orange-600",
    stats: ["18+ IIC members", "Est. 2021", "EDC + ATL"],
  },
  {
    title: "ITM International Journal",
    subtitle: "IIJISEM · Peer-reviewed",
    body: "Our peer-reviewed publication featuring faculty and student research across innovative science, engineering and management.",
    path: "/research/journal",
    icon: BookOpen,
    accent: "from-indigo-500 to-violet-700",
    stats: ["Peer reviewed", "Open access", "iijisem.com"],
  },
  {
    title: "International Conference",
    subtitle: "ITM IC 2025 · Jun 25-26",
    body: "Annual flagship conference — \"Bridge IKS and AI for sustainable business innovation\". 6 tracks, early-bird May 30.",
    path: "/research/conference",
    icon: Calendar,
    accent: "from-emerald-500 to-teal-700",
    stats: ["6 tracks", "Jun 25-26 '25", "Hybrid"],
  },
  {
    title: "Faculty Development",
    subtitle: "FDP · Inclusive Workspaces",
    body: "One-week National FDP on Gender Sensitivity and Cyber Hygiene. 6 expert resource persons, 5 course modules.",
    path: "/research/fdp",
    icon: Users,
    accent: "from-sky-500 to-blue-700",
    stats: ["7 days", "₹299 fee", "E-Certificate"],
  },
];

function BigNumber({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (l) => Math.round(l));
  useEffect(() => {
    if (isInView) {
      const c = animate(count, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1] });
      return c.stop;
    }
  }, [isInView, value, count]);
  return (<span ref={ref}><motion.span>{rounded}</motion.span>{suffix}</span>);
}

export default function Research() {
  const pageKey = useLocation().pathname;
  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5"><Home size={11} /> Home</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">Research</span>
        </div>
      </div>

      {/* Hero */}
      <section data-section="research_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-20 -left-10 w-96 h-96 rounded-full border border-white/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20 grid lg:grid-cols-12 gap-6 sm:gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <Sparkles size={12} /> <EditableText pageKey={pageKey} tkey="research.eyebrow" as="span" value="Research at ITM Gwalior">Research at ITM Gwalior</EditableText>
            </span>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-4">
              <EditableText pageKey={pageKey} tkey="research.title.line1" as="span" value="Five gateways">Five gateways</EditableText><br />
              <EditableText pageKey={pageKey} tkey="research.title.line2" as="span" value="into our research." className="text-red-200">into our research.</EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
              <EditableText pageKey={pageKey} tkey="research.intro" as="span" multiline
                value="R&D Cell · Innovation Ecosystem · International Journal · International Conference · Faculty Development. Pick any pillar below to dive deep.">
                R&amp;D Cell · Innovation Ecosystem · International Journal · International Conference · Faculty Development.
                Pick any pillar below to dive deep.
              </EditableText>
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { v: 5, l: "Research Pillars" },
              { v: 18, l: "IIC Council Members", suffix: "+" },
              { v: 6, l: "Years of Publications" },
              { v: 11, l: "R&D Focus Areas" },
            ].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 sm:p-5">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.04em] leading-none">
                  <BigNumber value={s.v} suffix={s.suffix || ""} />
                </div>
                <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-2">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillar cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Research Pillars</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Five focused sub-sections.
          </h2>
          <p className="text-sm text-gray-500 mt-3 font-medium">
            Each pillar opens into its own page with full detail, downloadable archives, and contacts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {HUB_LINKS.map((q, i) => (
            <Link to={q.path} key={q.title}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6 shadow-sm hover:shadow-2xl transition-shadow cursor-pointer h-full"
              >
                <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br ${q.accent} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative">
                  <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br ${q.accent} flex items-center justify-center text-white shadow-lg mb-5`}>
                    <q.icon size={22} />
                  </div>
                  <h3 className="font-black text-base tracking-tight text-gray-900 dark:text-white mb-1">{q.title}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">{q.subtitle}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-5 line-clamp-3 sm:line-clamp-none">{q.body}</p>
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {q.stats.map((s) => (
                      <span key={s} className="text-[9px] uppercase tracking-widest font-black px-2 py-1 bg-rose-50 dark:bg-gray-800 text-[#800000] dark:text-rose-400 rounded">{s}</span>
                    ))}
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#800000] group-hover:gap-3 transition-all">
                    Explore <ArrowRight size={12} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Contact strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white p-4 sm:p-8 md:p-12 grid md:grid-cols-2 gap-4 sm:gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <Award size={12} /> Collaborate with us
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-3">Research collaboration?</h3>
            <p className="text-red-100/80 text-sm font-medium max-w-md">
              Government-funded projects, industry-sponsored research, student incubation — start with our R&amp;D cell.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="mailto:iic@itmgoi.in" className="bg-white text-[#800000] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2">
              <Mail size={13} /> Email R&amp;D Cell
            </a>
            <a href="tel:+917889961796" className="bg-black/30 backdrop-blur text-white border border-white/30 text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-black/50 inline-flex items-center justify-center gap-2">
              <Phone size={13} /> +91-7889961796
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
