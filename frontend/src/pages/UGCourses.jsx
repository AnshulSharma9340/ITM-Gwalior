import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import {
  Search,
  Users,
  Clock,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  ArrowUpRight,
  X,
  Sparkles,
  PlusCircle,
  Scale,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Award,
  Layers,
  Target,
  Zap,
  Home,
  ChevronRight as Crumb,
  Table2,
  FileText,
  ClipboardList,
  HelpCircle,
  Monitor,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Globe,
  Network,
  Radio,
  Cog,
  Building2,
  FlaskConical,
  Code2,
} from "lucide-react";
import { UG_PROGRAMS } from "../data/admissions_data";

// ─── icon map: string name → Lucide component ─────────
const ICON_MAP = {
  Monitor,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Globe,
  Network,
  Radio,
  Cog,
  Building2,
  FlaskConical,
  Code2,
  Briefcase,
  Award,
};

/** Renders the correct Lucide icon for a programme, with a gradient background circle */
function ProgramIcon({ name, size = 28, className = "", wrapClass = "" }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  if (wrapClass) {
    return (
      <div className={wrapClass}>
        <Icon size={size} className={className} strokeWidth={1.8} />
      </div>
    );
  }
  return <Icon size={size} className={className} strokeWidth={1.8} />;
}

// ─── Official Admission Tables (verbatim from itmgoi.in) ───────────
const ELIG_PCM = "10+2 with PCM (Min. 45% for General, 40% for SC/ST/OBC)";
const ELIG_PCM_ALL = "10+2 with PCM and All Stream (Min. 45% for General, 40% for SC/ST/OBC)";
const ELIG_ANY = "10+2 with All Stream (Min. 45% for General, 40% for SC/ST/OBC)";

const OFFICIAL_TABLES = [
  {
    degree: "Bachelor of Technology (B.Tech)",
    short: "B.Tech",
    icon: "Award",
    duration: "4 Years",
    rows: [
      { name: "Computer Science Engineering", seats: 240, elig: ELIG_PCM },
      { name: "Computer Science Engineering (AI/ML)", seats: 90, elig: ELIG_PCM },
      { name: "Computer Science Engineering (Data Science)", seats: 90, elig: ELIG_PCM },
      { name: "Computer Science Engineering (Cyber Security)", seats: 60, elig: ELIG_PCM },
      { name: "Electronics & Communication Engineering", seats: 60, elig: ELIG_PCM },
      { name: "Mechanical Engineering", seats: 30, elig: ELIG_PCM },
      { name: "Civil Engineering", seats: 30, elig: ELIG_PCM },
      { name: "Information Technology", seats: 120, elig: ELIG_PCM },
      { name: "Chemical Engineering", seats: 30, elig: ELIG_PCM },
    ],
  },
  {
    degree: "Bachelor of Computer Application (BCA)",
    short: "BCA",
    icon: "Code2",
    duration: "3 Years",
    rows: [{ name: "Bachelor of Computer Application", seats: 60, elig: ELIG_PCM_ALL }],
  },
  {
    degree: "Bachelor of Business Administration (BBA)",
    short: "BBA",
    icon: "Briefcase",
    duration: "3 Years",
    rows: [{ name: "Bachelor of Business Administration", seats: 60, elig: ELIG_ANY }],
  },
];

const ADMISSION_SUBNAV = [
  { label: "UG Courses", to: "/admissions/ug", icon: Award, active: true },
  { label: "PG Courses", to: "/admissions/pg", icon: FileText },
  { label: "Enquiry Form", href: "http://itmgoi.in/OnlineApply_ITMGOI", icon: HelpCircle, external: true },
  { label: "Registration Form", href: "http://itmgoi.in/OnlineApply_ITMGOI", icon: ClipboardList, external: true },
  { label: "How To Seek Admission", to: "/admissions/how-to-apply", icon: ArrowRight },
];

const STREAM_GROUPS = {
  all: { label: "All Programmes", filter: () => true, accent: "from-rose-500 to-[#800000]" },
  computing: {
    label: "Computing & IT",
    filter: (p) => ["btech-cse", "btech-aiml", "btech-ds", "btech-cy", "btech-iot", "btech-it", "bca"].includes(p.id),
    accent: "from-indigo-500 to-violet-700",
  },
  core: {
    label: "Core Engineering",
    filter: (p) => ["btech-ece", "btech-me", "btech-ce", "btech-che"].includes(p.id),
    accent: "from-amber-500 to-orange-600",
  },
  business: {
    label: "Business",
    filter: (p) => ["bba"].includes(p.id),
    accent: "from-emerald-500 to-teal-700",
  },
};

// ─── animated counter ─────────────────────────────────
function BigNumber({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (l) => Math.round(l));

  useEffect(() => {
    const c = animate(count, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] });
    return c.stop;
  }, [value, count]);

  return (
    <motion.span ref={ref}>{rounded}</motion.span>
  );
}

export default function UGCourses() {
  const pageKey = useLocation().pathname;
  const [group, setGroup] = useState("all");
  const [activeId, setActiveId] = useState(UG_PROGRAMS[0].id);
  const [compare, setCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const stripRef = useRef(null);

  const filtered = useMemo(() => UG_PROGRAMS.filter(STREAM_GROUPS[group].filter), [group]);

  // Keep activeId valid when group changes
  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((p) => p.id === activeId)) {
      setActiveId(filtered[0].id);
    }
  }, [filtered, activeId]);

  const active = UG_PROGRAMS.find((p) => p.id === activeId) || filtered[0];

  const toggleCompare = (id) => {
    if (compare.includes(id)) setCompare(compare.filter((c) => c !== id));
    else if (compare.length < 3) setCompare([...compare, id]);
  };

  const toggleBookmark = (id) => {
    if (bookmarks.includes(id)) setBookmarks(bookmarks.filter((b) => b !== id));
    else setBookmarks([...bookmarks, id]);
  };

  const scrollStrip = (dir) => {
    if (!stripRef.current) return;
    stripRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const totalSeats = filtered.reduce((s, p) => s + p.seats, 0);
  const compareList = compare.map((id) => UG_PROGRAMS.find((p) => p.id === id));

  // Pick next & prev for arrow nav inside spotlight
  const currentIdx = filtered.findIndex((p) => p.id === active.id);
  const next = () => setActiveId(filtered[(currentIdx + 1) % filtered.length].id);
  const prev = () => setActiveId(filtered[(currentIdx - 1 + filtered.length) % filtered.length].id);

  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      {/* ─────────── BREADCRUMB ─────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5">
            <Home size={11} /> Home
          </Link>
          <Crumb size={10} className="text-gray-300" />
          <Link to="/admissions" className="hover:text-[#800000]">Admissions</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">UG Courses</span>
        </div>
      </div>

      {/* ─────────── ADMISSION SUB-NAV ─────────── */}
      <div className="bg-gradient-to-r from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {ADMISSION_SUBNAV.map((item) => {
              const inner = (
                <span className={`relative shrink-0 px-4 md:px-5 py-3.5 inline-flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                  item.active ? "text-white" : "text-rose-100/70 hover:text-white"
                }`}>
                  <item.icon size={12} />
                  {item.label}
                  {item.external && <ArrowUpRight size={9} className="opacity-60" />}
                  {item.active && (
                    <span className="absolute bottom-0 left-3 right-3 h-1 bg-amber-300 rounded-t-full"></span>
                  )}
                </span>
              );
              return item.external ? (
                <a key={item.label} href={item.href} target="_blank" rel="noreferrer">{inner}</a>
              ) : (
                <Link key={item.label} to={item.to}>{inner}</Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────── HERO ─────────── */}
      <section data-section="ug_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-20 -left-10 w-80 h-80 rounded-full border border-white/40"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <Link to="/admissions" className="text-[10px] font-black uppercase tracking-widest text-red-200 hover:text-white inline-flex items-center gap-1 mb-3">
            ← Admissions
          </Link>
          <div className="grid lg:grid-cols-12 gap-6 items-end">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
                <Sparkles size={12} /> 12 Undergraduate Programmes · Spotlight Explorer
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-3">
                <EditableText pageKey={pageKey} tkey="ug.title.line1" as="span" value="Spotlight on">Spotlight on</EditableText><br />
                <EditableText pageKey={pageKey} tkey="ug.title.line2" as="span" value="your future." className="text-red-200">your future.</EditableText>
              </h1>
              <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
                <EditableText pageKey={pageKey} tkey="ug.intro" as="span" multiline
                  value="Pick a stream below, explore each programme in full focus. Bookmark favourites, compare side-by-side, then apply.">
                  Pick a stream below, explore each programme in full focus.
                  Bookmark favourites, compare side-by-side, then apply.
                </EditableText>
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3">
                <div className="text-3xl font-black tracking-[-0.04em] leading-none"><BigNumber value={filtered.length} /></div>
                <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-1">Programmes</div>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3">
                <div className="text-3xl font-black tracking-[-0.04em] leading-none"><BigNumber value={totalSeats} /></div>
                <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-1">Total Seats</div>
              </div>
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-5 py-3">
                <div className="text-3xl font-black tracking-[-0.04em] leading-none">{bookmarks.length || "—"}</div>
                <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-1">Bookmarked</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── STREAM TABS ─────────── */}
      <section className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-2">
          {Object.entries(STREAM_GROUPS).map(([id, g]) => (
            <button
              key={id}
              onClick={() => setGroup(id)}
              className={`relative px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition ${
                group === id ? "text-white shadow-lg" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {group === id && (
                <motion.span layoutId="ug-stream-spot" className={`absolute inset-0 bg-gradient-to-r ${g.accent} rounded-full`} transition={{ type: "spring", stiffness: 300, damping: 30 }}></motion.span>
              )}
              <span className="relative">{g.label}</span>
              <span className={`relative ml-2 text-[9px] ${group === id ? "text-white/70" : "text-gray-400"}`}>
                {id === "all" ? UG_PROGRAMS.length : UG_PROGRAMS.filter(STREAM_GROUPS[id].filter).length}
              </span>
            </button>
          ))}

          {compare.length > 0 && (
            <button onClick={() => setShowCompare(true)} className="ml-auto inline-flex items-center gap-2 bg-[#800000] text-white px-4 py-2 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-red-900">
              <Scale size={12} /> Compare ({compare.length})
            </button>
          )}
        </div>
      </section>

      {/* ─────────── SPOTLIGHT PANEL ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Prev / Next arrows — positioned OUTSIDE the card frame */}
              <button
                onClick={prev}
                className="absolute -left-5 md:-left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-gray-900 border-2 border-rose-100 dark:border-gray-700 text-[#800000] flex items-center justify-center hover:bg-[#800000] hover:text-white hover:border-[#800000] transition-colors shadow-lg"
                title="Previous"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={next}
                className="absolute -right-5 md:-right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white dark:bg-gray-900 border-2 border-rose-100 dark:border-gray-700 text-[#800000] flex items-center justify-center hover:bg-[#800000] hover:text-white hover:border-[#800000] transition-colors shadow-lg"
                title="Next"
              >
                <ChevronRight size={20} />
              </button>

              <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl">
              {/* Background — uses programme's accent gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${active.accent}`}></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-black/10 to-transparent"></div>
              <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
                  backgroundSize: "32px 32px",
                }}
              ></div>

              {/* Big floating icon backdrop */}
              <div className="absolute -top-10 -right-10 opacity-[0.08] pointer-events-none select-none leading-none">
                <ProgramIcon name={active.icon} size={320} className="text-white" />
              </div>

              <div className="relative p-8 md:p-14 grid lg:grid-cols-12 gap-8 text-white">

                {/* LEFT: programme content */}
                <div className="lg:col-span-7">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/15 backdrop-blur px-3 py-1.5 rounded-full border border-white/20">
                      {active.code} · {active.short}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
                      {currentIdx + 1} / {filtered.length}
                    </span>
                  </div>

                  <div className="mb-6">
                    <ProgramIcon
                      name={active.icon}
                      size={56}
                      className="text-white"
                      wrapClass="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center"
                    />
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-5">
                    {active.name}
                  </h2>

                  <p className="text-base md:text-lg text-white/90 max-w-xl leading-relaxed font-medium mb-6">
                    {active.eligibility}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-8">
                    {active.tags.map((t) => (
                      <span key={t} className="text-[10px] uppercase tracking-widest font-black px-3 py-1.5 bg-white/15 backdrop-blur border border-white/20 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-2">
                    <Link to="/admissions/how-to-apply" className="group inline-flex items-center gap-2 bg-white text-[#1a0606] px-6 py-3.5 rounded-full font-black text-[11px] tracking-[0.25em] uppercase hover:scale-[1.02] transition-transform shadow-xl">
                      Apply For This
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                      onClick={() => toggleCompare(active.id)}
                      className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-full font-black text-[11px] tracking-[0.25em] uppercase border transition ${
                        compare.includes(active.id)
                          ? "bg-amber-300 text-[#1a0606] border-amber-300"
                          : "bg-white/10 backdrop-blur text-white border-white/30 hover:bg-white/20"
                      }`}
                    >
                      {compare.includes(active.id) ? <CheckCircle2 size={13} /> : <PlusCircle size={13} />}
                      {compare.includes(active.id) ? "In compare" : "Compare"}
                    </button>
                    <button
                      onClick={() => toggleBookmark(active.id)}
                      className={`w-12 h-12 rounded-full backdrop-blur border flex items-center justify-center transition ${
                        bookmarks.includes(active.id)
                          ? "bg-amber-300 text-[#1a0606] border-amber-300"
                          : "bg-white/10 text-white border-white/30 hover:bg-white/20"
                      }`}
                      title="Bookmark"
                    >
                      <Bookmark size={14} fill={bookmarks.includes(active.id) ? "currentColor" : "none"} />
                    </button>
                  </div>
                </div>

                {/* RIGHT: stats column */}
                <div className="lg:col-span-5 space-y-3">

                  {/* Massive seat count */}
                  <div className="bg-white/15 backdrop-blur border border-white/20 rounded-3xl p-7">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mb-2">Annual Intake</div>
                    <div className="text-7xl md:text-8xl font-black tracking-[-0.05em] leading-none">
                      <BigNumber value={active.seats} />
                    </div>
                    <div className="text-xs mt-2 text-white/80 font-bold">sanctioned seats per academic year</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                      <Clock size={16} className="text-amber-300 mb-2" />
                      <div className="text-3xl font-black tracking-[-0.04em] leading-none">{active.duration.split(" ")[0]}Y</div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-white/70 mt-1">{active.semesters} Semesters</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                      <Briefcase size={16} className="text-amber-300 mb-2" />
                      <div className="text-3xl font-black tracking-[-0.04em] leading-none">{active.careers.length}</div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-white/70 mt-1">Career Tracks</div>
                    </div>
                  </div>

                  {/* Careers preview */}
                  <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 mb-3">
                      <Target size={11} /> Career Outcomes
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {active.careers.map((c) => (
                        <span key={c} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 bg-white/15 rounded-lg">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─────────── HORIZONTAL PROGRAMME STRIP ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Browse {filtered.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollStrip(-1)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-700 hover:border-[#800000] text-[#800000] flex items-center justify-center transition">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => scrollStrip(1)} className="w-10 h-10 rounded-full bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-700 hover:border-[#800000] text-[#800000] flex items-center justify-center transition">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div
          ref={stripRef}
          className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filtered.map((p) => {
            const isActive = p.id === active.id;
            const isBookmarked = bookmarks.includes(p.id);
            return (
              <motion.button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                whileHover={{ y: -4 }}
                className={`group relative shrink-0 w-64 snap-start text-left overflow-hidden rounded-3xl border-2 transition-all ${
                  isActive
                    ? "border-[#800000] shadow-2xl ring-4 ring-rose-100"
                    : "border-rose-50 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-rose-200 dark:hover:border-gray-600 shadow-sm hover:shadow-lg"
                }`}
              >
                {/* Top accent bar */}
                <div className={`h-2 bg-gradient-to-r ${p.accent}`}></div>

                {/* Body */}
                <div className="p-5 bg-white dark:bg-gray-900">
                  <div className="flex items-start justify-between mb-3">
                    <ProgramIcon
                      name={p.icon}
                      size={28}
                      className="text-[#800000]"
                      wrapClass="w-12 h-12 rounded-xl bg-rose-50 dark:bg-gray-800 flex items-center justify-center"
                    />
                    {isBookmarked && (
                      <Bookmark size={14} className="text-amber-500" fill="currentColor" />
                    )}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">{p.code}</div>
                  <h4 className="font-black text-sm tracking-tight text-[#1a0606] dark:text-white leading-snug min-h-[2.5rem] line-clamp-2">
                    {p.name}
                  </h4>

                  <div className="flex items-baseline gap-3 mt-4 pt-4 border-t border-rose-50 dark:border-gray-800">
                    <div>
                      <div className="text-2xl font-black tracking-[-0.04em] text-[#800000] leading-none">{p.seats}</div>
                      <div className="text-[8px] uppercase tracking-widest font-black text-gray-400 mt-0.5">seats</div>
                    </div>
                    <div className="ml-auto text-[10px] uppercase tracking-widest font-black text-gray-400">{p.duration}</div>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="active-strip-indicator"
                      className="absolute bottom-0 left-5 right-5 h-1 bg-[#800000] rounded-full"
                    ></motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* ─────────── PROGRAMME DEEP DETAILS ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={`detail-${active.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-3 gap-4"
            >
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-gray-800 text-[#800000] flex items-center justify-center mb-4">
                  <CheckCircle2 size={18} />
                </div>
                <div className="text-[9px] uppercase tracking-[0.25em] font-black text-[#800000] mb-1.5">Eligibility</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{active.eligibility}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-gray-800 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
                  <Award size={18} />
                </div>
                <div className="text-[9px] uppercase tracking-[0.25em] font-black text-amber-700 dark:text-amber-400 mb-1.5">Selection</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{active.selection}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 p-6 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-gray-800 text-emerald-700 flex items-center justify-center mb-4">
                  <Layers size={18} />
                </div>
                <div className="text-[9px] uppercase tracking-[0.25em] font-black text-emerald-700 mb-1.5">Structure</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  {active.duration} · {active.semesters} semesters · {active.seats} sanctioned seats per academic year
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ─────────── BOOKMARKS RAIL ─────────── */}
      <AnimatePresence>
        {bookmarks.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#1a0606] text-white rounded-full shadow-2xl border border-amber-300/30 px-3 py-2 flex items-center gap-2"
          >
            <Bookmark size={14} className="text-amber-300" fill="currentColor" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {bookmarks.length} Bookmarked
            </span>
            <div className="flex -space-x-2 ml-1">
              {bookmarks.slice(0, 4).map((id) => {
                const p = UG_PROGRAMS.find((x) => x.id === id);
                return (
                  <span key={id} className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.accent} flex items-center justify-center border-2 border-[#1a0606] cursor-pointer`}
                    onClick={() => setActiveId(id)}
                    title={p.name}
                  >
                    <ProgramIcon name={p.icon} size={14} className="text-white" />
                  </span>
                );
              })}
            </div>
            <button
              onClick={() => setBookmarks([])}
              className="ml-2 text-[9px] uppercase tracking-widest font-black text-amber-300 hover:text-white"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────── OFFICIAL ADMISSION TABLES ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 mb-3">
            <Table2 size={12} className="text-[#800000]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Official Intake Tables</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05] mb-3">
            Undergraduate Courses
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            The following programs are offered under the Bachelor of Technology (B.Tech), BCA and BBA degrees.
            Intake and eligibility figures verified from ITM Gwalior&apos;s official records.
          </p>
        </div>

        <div className="space-y-8">
          {OFFICIAL_TABLES.map((tbl) => (
            <motion.div
              key={tbl.short}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl"
            >
              {/* Programme header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-[#3e0202] via-[#800000] to-[#5a0000] text-white p-6 md:p-7">
                <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none leading-none">
                  <ProgramIcon name={tbl.icon} size={180} className="text-white" />
                </div>
                <div className="relative flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300 mb-1">Program</div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-[-0.03em] leading-tight">
                      {tbl.degree}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/15 backdrop-blur rounded-full border border-white/20">
                      {tbl.rows.length} Programme{tbl.rows.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-amber-300 text-[#1a0606] rounded-full">
                      <Clock size={11} className="inline mr-1" /> {tbl.duration}
                    </span>
                    <Link
                      to="/admissions/how-to-apply"
                      title="How to apply"
                      className="group inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white text-[#800000] rounded-full hover:bg-amber-300 hover:text-[#1a0606] transition-colors shadow-md"
                    >
                      Apply
                      <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Table — desktop */}
              <div className="hidden md:block overflow-x-auto -mx-4 px-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-rose-50/50 dark:bg-gray-800/50">
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-12">#</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Program</th>
                      <th className="text-center p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-24">Seats</th>
                      <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Eligibility</th>
                      <th className="text-center p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-28">Duration</th>
                      <th className="text-center p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-24"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tbl.rows.map((row, i) => (
                      <tr key={row.name} className="border-t border-rose-50 dark:border-gray-800 hover:bg-rose-50/30 dark:hover:bg-gray-800/50 transition-colors group">
                        <td className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
                          {String(i + 1).padStart(2, "0")}
                        </td>
                        <td className="p-4 font-black text-[#1a0606] dark:text-white tracking-tight">{row.name}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-[#800000] text-white rounded-lg font-black text-sm">
                            {row.seats}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{row.elig}</td>
                        <td className="p-4 text-center text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{tbl.duration}</td>
                        <td className="p-4 text-center">
                          <Link to="/admissions/how-to-apply" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-50 dark:bg-gray-800 text-[#800000] hover:bg-[#800000] hover:text-white transition-colors group-hover:scale-110" title="Apply">
                            <ArrowRight size={14} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#800000]/20 bg-gradient-to-r from-amber-50/50 to-rose-50/50">
                      <td colSpan="2" className="p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Total Sanctioned Intake</td>
                      <td className="p-4 text-center">
                        <span className="text-2xl font-black tracking-[-0.04em] text-[#800000]">
                          {tbl.rows.reduce((s, r) => s + r.seats, 0)}
                        </span>
                      </td>
                      <td colSpan="3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile — stacked cards */}
              <div className="md:hidden divide-y divide-rose-50 dark:divide-gray-800">
                {tbl.rows.map((row, i) => (
                  <div key={row.name} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug flex-1">
                        {row.name}
                      </h4>
                      <span className="shrink-0 inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 bg-[#800000] text-white rounded-lg font-black text-xs">
                        {row.seats}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-2">{row.elig}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                        <Clock size={10} className="inline mr-1" /> {tbl.duration}
                      </span>
                      <Link to="/admissions/how-to-apply" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#800000]">
                        Apply <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                ))}
                <div className="p-4 bg-amber-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#800000]">Total Intake</span>
                  <span className="text-2xl font-black text-[#800000] tracking-tight">{tbl.rows.reduce((s, r) => s + r.seats, 0)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Source footnote */}
        <div className="mt-6 text-center">
          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
            Source: ITM Gwalior official admissions page (itmgoi.in) · Subject to revision per AICTE / RGPV norms
          </p>
        </div>
      </section>

      {/* ─────────── LATERAL ENTRY CALLOUT ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 border border-emerald-200 dark:border-gray-700 p-8 md:p-10 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full mb-3">
              <Zap size={12} className="text-emerald-700" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Lateral Entry</span>
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white mb-3">
              Diploma in hand? Skip year 1.
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed mb-4">
              Direct admission to 2nd year B.Tech for Diploma / B.Sc holders across all branches. Graduate in 3 years.
            </p>
            <Link to="/admissions/how-to-apply" className="inline-flex items-center gap-2 bg-emerald-700 text-white px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-emerald-800 transition-colors">
              Lateral Entry Guide <ArrowRight size={12} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: "3", l: "Years (Direct 2nd-yr)" },
              { n: "All", l: "B.Tech Branches" },
              { n: "Diploma", l: "From any State Board" },
              { n: "B.Sc", l: "With PCM eligible" },
            ].map((b) => (
              <div key={b.l} className="bg-white dark:bg-gray-900 border border-emerald-100 dark:border-gray-700 rounded-2xl p-4 text-center">
                <div className="text-2xl font-black tracking-tight text-emerald-700">{b.n}</div>
                <div className="text-[9px] uppercase tracking-widest font-black text-emerald-700/70 mt-1">{b.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── COMPARE DRAWER ─────────── */}
      <AnimatePresence>
        {showCompare && compareList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCompare(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end md:items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-5xl w-full shadow-2xl my-8 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-black text-xl tracking-tight text-[#1a0606] dark:text-white">Side-by-side comparison</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{compareList.length} programme{compareList.length !== 1 ? "s" : ""}</p>
                </div>
                <button onClick={() => setShowCompare(false)} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-x-auto -mx-4 px-4 max-h-[70vh]">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-4 bg-gray-50 dark:bg-gray-800 sticky left-0 w-32 text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">Spec</th>
                      {compareList.map((p) => (
                        <th key={p.id} className="text-left p-4 min-w-[200px]">
                          <ProgramIcon name={p.icon} size={24} className="text-[#800000]" wrapClass="w-10 h-10 rounded-xl bg-rose-50 dark:bg-gray-800 flex items-center justify-center mb-2" />
                          <div className="text-[9px] font-black uppercase tracking-widest text-gray-400">{p.code}</div>
                          <div className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight">{p.short}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {[
                      { k: "Full Name", get: (p) => p.name },
                      { k: "Intake", get: (p) => `${p.seats} seats` },
                      { k: "Duration", get: (p) => `${p.duration} · ${p.semesters} sem` },
                      { k: "Eligibility", get: (p) => p.eligibility },
                      { k: "Selection", get: (p) => p.selection },
                      { k: "Top Careers", get: (p) => p.careers.join(", ") },
                      { k: "Tags", get: (p) => p.tags.join(" · ") },
                    ].map((row) => (
                      <tr key={row.k} className="border-t border-gray-100 dark:border-gray-800">
                        <td className="p-4 bg-gray-50 dark:bg-gray-800 text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 sticky left-0">{row.k}</td>
                        {compareList.map((p) => (
                          <td key={p.id} className="p-4 text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                            {row.get(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex gap-2 flex-wrap">
                <Link to="/admissions/how-to-apply" className="inline-flex items-center gap-2 bg-[#800000] text-white px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase">
                  Apply Now <ArrowRight size={12} />
                </Link>
                <button onClick={() => { setCompare([]); setShowCompare(false); }} className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-gray-200 dark:hover:bg-gray-700">
                  Clear all
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
