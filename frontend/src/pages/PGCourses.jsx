import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Clock,
  CheckCircle2,
  Briefcase,
  ArrowRight,
  ArrowUpRight,
  Award,
  Sparkles,
  Layers,
  Microscope,
  TrendingUp,
  GraduationCap,
  FileText,
  Home,
  ChevronRight as Crumb,
  Table2,
  ClipboardList,
  HelpCircle,
  Monitor,
  Cpu,
  Wallet,
  Handshake,
} from "lucide-react";
import { PG_PROGRAMS, SELECTION_PROCESS } from "../data/admissions_data";

// ─── icon map: string name → Lucide component ─────────
const PG_ICON_MAP = {
  GraduationCap,
  Cpu,
  TrendingUp,
  Monitor,
  Wallet,
  Handshake,
  Award,
};

/** Renders a Lucide icon with optional wrapping container */
function ProgramIcon({ name, size = 28, className = "", wrapClass = "" }) {
  const Icon = PG_ICON_MAP[name];
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

// ─── Official PG Admission Table (verbatim from itmgoi.in) ───────
const OFFICIAL_PG_TABLE = {
  degree: "ITM (Institute of Technology & Management) — PG",
  intro: "The institute offers the following Postgraduate degree programmes.",
  rows: [
    { name: "M.Tech. (CS)", seats: 9, elig: "B.E./B. Tech. in concerned Branch", duration: "2 Years", icon: "GraduationCap" },
    { name: "M.Tech. (VLSI)", seats: 9, elig: "B.E./B. Tech. in concerned Branch", duration: "2 Years", icon: "Cpu" },
    { name: "MBA (MM, FM, HR)", seats: 120, elig: "Any Graduate with 50 % Marks.", duration: "2 Years", icon: "TrendingUp" },
    { name: "MCA", seats: 60, elig: "Any Graduate with Mathematics / Physics at 10+2 level.", duration: "2 Years", icon: "Monitor" },
  ],
};

const ADMISSION_SUBNAV = [
  { label: "UG Courses", to: "/admissions/ug", icon: GraduationCap },
  { label: "PG Courses", to: "/admissions/pg", icon: Award, active: true },
  { label: "Enquiry Form", href: "http://itmgoi.in/OnlineApply_ITMGOI", icon: HelpCircle, external: true },
  { label: "Registration Form", href: "http://itmgoi.in/OnlineApply_ITMGOI", icon: ClipboardList, external: true },
  { label: "How To Seek Admission", to: "/admissions/how-to-apply", icon: ArrowRight },
];

const MBA_STREAMS = [
  {
    id: "mm",
    name: "Marketing Management",
    code: "MM",
    icon: "TrendingUp",
    accent: "from-rose-500 to-[#800000]",
    careers: ["Brand Manager", "Sales Head", "Digital Marketing Lead", "Product Marketer"],
    topics: ["Consumer Behaviour", "Sales Strategy", "Digital Marketing", "Marketing Research", "Brand Management"],
    desc: "Lead brand-building, GTM strategy and demand generation. Heavy on case studies and live industry projects.",
  },
  {
    id: "fm",
    name: "Financial Management",
    code: "FM",
    icon: "Wallet",
    accent: "from-amber-500 to-orange-600",
    careers: ["Financial Analyst", "Investment Banker", "Treasury Manager", "Wealth Advisor"],
    topics: ["Corporate Finance", "Equity Research", "Risk Management", "Banking Operations", "Derivatives"],
    desc: "Quant-heavy track for finance careers in banking, equity research, and corporate treasury.",
  },
  {
    id: "hr",
    name: "Human Resources",
    code: "HR",
    icon: "Handshake",
    accent: "from-emerald-500 to-teal-700",
    careers: ["HR Business Partner", "Talent Acquisition", "L&D Manager", "Comp & Benefits"],
    topics: ["Organisational Behaviour", "Talent Management", "Industrial Relations", "Comp & Benefits", "HR Analytics"],
    desc: "Build people strategy, OD and change management capability for modern workplaces.",
  },
];

const ENTRY_EXAMS = [
  { name: "GATE", for: "M.Tech CS · M.Tech VLSI", validity: "3 years", note: "Preferred for stipend / fellowship" },
  { name: "CMAT", for: "MBA", validity: "Yearly", note: "Conducted by NTA" },
  { name: "Pre-MCA", for: "MCA", validity: "Yearly", note: "DTE MP conducted" },
  { name: "UG / BE merit", for: "All — fallback route", validity: "Permanent", note: "If no entrance score" },
];

export default function PGCourses() {
  const pageKey = useLocation().pathname;
  const [active, setActive] = useState(PG_PROGRAMS[0].id);
  const [mbaStream, setMbaStream] = useState("mm");
  const activeProgram = PG_PROGRAMS.find((p) => p.id === active);
  const activeStream = MBA_STREAMS.find((s) => s.id === mbaStream);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/20 via-white to-white dark:from-[#020617] dark:to-[#020617]">

      {/* ─────────── BREADCRUMB ─────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5">
            <Home size={11} /> Home
          </Link>
          <Crumb size={10} className="text-gray-300" />
          <Link to="/admissions" className="hover:text-[#800000]">Admissions</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">PG Courses</span>
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

      {/* ── HERO ─────────────────────────────────────────── */}
      <section data-section="pg_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-40 w-72 h-72 rounded-full border-2 border-white"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <Link to="/admissions" className="text-[10px] font-black uppercase tracking-widest text-red-200 hover:text-white inline-flex items-center gap-1 mb-3">
              ← Admissions
            </Link>
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <Sparkles size={12} /> Postgraduate Programmes
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-3">
              <EditableText pageKey={pageKey} tkey="pg.title.line1" as="span" value="Master the next">Master the next</EditableText><br />
              <EditableText pageKey={pageKey} tkey="pg.title.line2" as="span" value="decade." className="text-red-200">decade.</EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
              <EditableText pageKey={pageKey} tkey="pg.intro" as="span" multiline
                value="M.Tech in CS & VLSI, MCA, and our flagship MBA with three deep specialisations. All routed through DTE Bhopal counselling.">
                M.Tech in CS & VLSI, MCA, and our flagship MBA with three deep specialisations.
                All routed through DTE Bhopal counselling.
              </EditableText>
            </p>
          </div>

          {/* Entrance exam matrix */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Accepted Entrance Scores</span>
            </div>
            <div className="space-y-2.5">
              {ENTRY_EXAMS.map((e) => (
                <div key={e.name} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm tracking-tight">{e.name}</span>
                    <span className="text-[9px] uppercase tracking-widest font-black text-amber-300">{e.validity}</span>
                  </div>
                  <div className="text-[10px] text-rose-100/70 font-medium">{e.for} · {e.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE PROGRAMME EXPLORER ─────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Explore</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Four programmes. Three of them MBA-stream picks.
          </h2>

        </div>

        <div className="grid lg:grid-cols-12 gap-6">

          {/* Programme list */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {PG_PROGRAMS.map((p) => (
              <motion.button
                key={p.id}
                onClick={() => setActive(p.id)}
                whileHover={{ x: 4 }}
                className={`text-left group relative overflow-hidden rounded-2xl border-2 transition-all ${
                  active === p.id ? "border-[#800000] bg-white dark:bg-gray-900 shadow-xl" : "border-rose-50 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 hover:border-rose-200"
                }`}
              >
                {active === p.id && <motion.div layoutId="pg-active-bar" className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${p.accent}`} />}
                <div className="p-5 flex items-center gap-4">
                  <ProgramIcon
                    name={p.icon}
                    size={24}
                    className="text-[#800000]"
                    wrapClass="w-10 h-10 rounded-xl bg-rose-50 dark:bg-gray-800 flex items-center justify-center shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{p.code}</div>
                    <h4 className="font-black text-sm text-gray-900 dark:text-white tracking-tight leading-snug truncate">{p.short}</h4>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mt-0.5">{p.seats} seats · {p.duration}</p>
                  </div>
                  <ArrowRight size={14} className={`shrink-0 transition-colors ${active === p.id ? "text-[#800000]" : "text-gray-300"}`} />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProgram.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl"
              >
                <div className={`h-2 bg-gradient-to-r ${activeProgram.accent}`}></div>

                <div className="p-8 md:p-10 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <ProgramIcon
                        name={activeProgram.icon}
                        size={36}
                        className="text-[#800000]"
                        wrapClass="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-gray-800 flex items-center justify-center mb-3"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#800000]">{activeProgram.code}</span>
                      <h3 className="font-black text-2xl md:text-3xl tracking-tighter text-gray-900 dark:text-white leading-tight mt-1">
                        {activeProgram.name}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="bg-rose-50 dark:bg-gray-800 rounded-2xl p-4">
                      <Users size={16} className="text-[#800000] mb-2" />
                      <div className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">{activeProgram.seats}</div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-gray-400 mt-0.5">Intake</div>
                    </div>
                    <div className="bg-rose-50 dark:bg-gray-800 rounded-2xl p-4">
                      <Clock size={16} className="text-[#800000] mb-2" />
                      <div className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">{activeProgram.duration}</div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-gray-400 mt-0.5">Duration</div>
                    </div>
                    <div className="bg-rose-50 dark:bg-gray-800 rounded-2xl p-4">
                      <Layers size={16} className="text-[#800000] mb-2" />
                      <div className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">{activeProgram.semesters}</div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-gray-400 mt-0.5">Semesters</div>
                    </div>
                    <div className="bg-rose-50 dark:bg-gray-800 rounded-2xl p-4">
                      <Award size={16} className="text-[#800000] mb-2" />
                      <div className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">PG</div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-gray-400 mt-0.5">Level</div>
                    </div>
                  </div>

                  {/* MBA: interactive stream picker */}
                  {activeProgram.id === "mba" && (
                    <div className="mb-6 p-5 bg-gradient-to-br from-amber-50 dark:from-gray-800 to-rose-50 dark:to-gray-800 rounded-2xl border border-amber-100 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">
                        <Sparkles size={12} /> Pick your MBA stream
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {MBA_STREAMS.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setMbaStream(s.id)}
                            className={`relative p-3 rounded-2xl border-2 transition-all text-left ${
                              mbaStream === s.id ? "border-[#800000] bg-white dark:bg-gray-900 shadow-lg" : "border-transparent bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900"
                            }`}
                          >
                            <ProgramIcon
                              name={s.icon}
                              size={20}
                              className="text-[#800000]"
                              wrapClass="w-9 h-9 rounded-xl bg-rose-50 dark:bg-gray-800 flex items-center justify-center mb-1"
                            />
                            <div className="text-[9px] uppercase tracking-widest font-black text-gray-400">{s.code}</div>
                            <div className="text-xs font-black text-[#1a0606] dark:text-white tracking-tight">{s.name}</div>
                          </button>
                        ))}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeStream.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className="space-y-4"
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{activeStream.desc}</p>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2 flex items-center gap-1">
                              <Microscope size={11} /> Core Topics
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {activeStream.topics.map((t) => (
                                <span key={t} className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1 bg-white dark:bg-gray-800 text-[#800000] rounded-full border border-rose-100 dark:border-gray-700">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2 flex items-center gap-1">
                              <TrendingUp size={11} /> Career Roles
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {activeStream.careers.map((c) => (
                                <span key={c} className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1 bg-[#800000] text-white rounded-full">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#800000] mb-2">
                        <CheckCircle2 size={12} /> Eligibility
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{activeProgram.eligibility}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#800000] mb-2">
                        <CheckCircle2 size={12} /> Selection
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{activeProgram.selection}</p>
                    </div>

                    {activeProgram.id !== "mba" && (
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#800000] mb-2">
                          <Briefcase size={12} /> Career Outcomes
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {activeProgram.careers.map((c) => (
                            <span key={c} className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1.5 bg-rose-50 dark:bg-gray-800 text-[#800000] rounded-full">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link to="/admissions/how-to-apply" className="flex-1 bg-[#800000] text-white text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-red-900 inline-flex items-center justify-center gap-2">
                      Apply Now <ArrowRight size={14} />
                    </Link>
                    <a href="http://itmgoi.in/OnlineApply_ITMGOI" target="_blank" rel="noreferrer" className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-gray-200">
                      Open Application Portal
                    </a>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── SELECTION PROCESS DETAIL CARDS ─────────────────── */}
      <section className="bg-[#1a0606] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-300/30 mb-3">
              <GraduationCap size={12} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                DTE Bhopal Counselling
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05]">
              Selection rules for{" "}
              <span className="bg-gradient-to-r from-amber-300 to-rose-200 bg-clip-text text-transparent">
                every PG stream.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {SELECTION_PROCESS.filter((sp) => sp.code !== "B.Tech").map((sp, i) => (
              <motion.div
                key={sp.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden bg-white/[0.04] backdrop-blur border border-white/10 rounded-3xl p-6 hover:bg-white/[0.06] transition-colors"
              >
                <div className={`absolute top-0 left-6 right-6 h-1 bg-gradient-to-r ${sp.accent} rounded-b-full`}></div>
                <h3 className="font-black text-lg tracking-tight mb-1">{sp.code}</h3>
                <p className="text-[10px] uppercase tracking-widest font-bold text-amber-300/80 mb-4">{sp.duration}</p>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">Eligibility</div>
                    <p className="text-white/85 leading-relaxed font-medium">{sp.eligibility}</p>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">Selection Process</div>
                    <p className="text-white/85 leading-relaxed font-medium">{sp.selection}</p>
                  </div>
                  {sp.streams && (
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">Streams</div>
                      <div className="flex flex-wrap gap-1.5">
                        {sp.streams.map((s) => (
                          <span key={s} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-300/20 text-amber-200 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── OFFICIAL PG ADMISSION TABLE ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 mb-3">
            <Table2 size={12} className="text-[#800000]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Official Intake Table</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05] mb-3">
            Post Graduate Courses
          </h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            {OFFICIAL_PG_TABLE.intro} Intake and eligibility figures verified from ITM Gwalior&apos;s official records.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl"
        >
          {/* Programme header */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#3e0202] via-[#800000] to-[#5a0000] text-white p-6 md:p-7">
            <div className="absolute -top-12 -right-12 opacity-10 pointer-events-none leading-none">
              <ProgramIcon name="GraduationCap" size={180} className="text-white" />
            </div>
            <div className="relative flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300 mb-1">Programmes Offered</div>
                <h3 className="text-2xl md:text-3xl font-black tracking-[-0.03em] leading-tight">
                  {OFFICIAL_PG_TABLE.degree}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/15 backdrop-blur rounded-full border border-white/20">
                  {OFFICIAL_PG_TABLE.rows.length} Programmes
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-amber-300 text-[#1a0606] rounded-full">
                  <Clock size={11} className="inline mr-1" /> 2 Years each
                </span>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-rose-50/50 dark:bg-gray-800/50">
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-12">#</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Programme</th>
                  <th className="text-center p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-24">Seats</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Eligibility</th>
                  <th className="text-center p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-28">Duration</th>
                  <th className="text-center p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] w-24"></th>
                </tr>
              </thead>
              <tbody>
                {OFFICIAL_PG_TABLE.rows.map((row, i) => (
                  <tr key={row.name} className="border-t border-rose-50 dark:border-gray-800 hover:bg-rose-50/30 dark:hover:bg-gray-800/50 transition-colors group">
                    <td className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProgramIcon
                          name={row.icon}
                          size={18}
                          className="text-[#800000]"
                          wrapClass="w-8 h-8 rounded-lg bg-rose-50 dark:bg-gray-800 flex items-center justify-center shrink-0"
                        />
                        <span className="font-black text-[#1a0606] dark:text-white tracking-tight">{row.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 bg-[#800000] text-white rounded-lg font-black text-sm">
                        {String(row.seats).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{row.elig}</td>
                    <td className="p-4 text-center text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-300">{row.duration}</td>
                    <td className="p-4 text-center">
                      <Link to="/admissions/how-to-apply" className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-rose-50 dark:bg-gray-800 text-[#800000] hover:bg-[#800000] hover:text-white transition-colors group-hover:scale-110" title="Apply">
                        <ArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#800000]/20 bg-gradient-to-r from-amber-50/50 dark:from-gray-800/50 to-rose-50/50 dark:to-gray-800/50">
                  <td colSpan="2" className="p-4 text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">Total Sanctioned Intake</td>
                  <td className="p-4 text-center">
                    <span className="text-2xl font-black tracking-[-0.04em] text-[#800000]">
                      {OFFICIAL_PG_TABLE.rows.reduce((s, r) => s + r.seats, 0)}
                    </span>
                  </td>
                  <td colSpan="3"></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Mobile — stacked cards */}
          <div className="md:hidden divide-y divide-rose-50 dark:divide-gray-800">
            {OFFICIAL_PG_TABLE.rows.map((row) => (
              <div key={row.name} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <ProgramIcon
                      name={row.icon}
                      size={18}
                      className="text-[#800000]"
                      wrapClass="w-8 h-8 rounded-lg bg-rose-50 dark:bg-gray-800 flex items-center justify-center shrink-0"
                    />
                    <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug">{row.name}</h4>
                  </div>
                  <span className="shrink-0 inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 bg-[#800000] text-white rounded-lg font-black text-xs">
                    {String(row.seats).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-2">{row.elig}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    <Clock size={10} className="inline mr-1" /> {row.duration}
                  </span>
                  <Link to="/admissions/how-to-apply" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#800000]">
                    Apply <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            ))}
            <div className="p-4 bg-amber-50/50 dark:bg-gray-800/50 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#800000]">Total Intake</span>
              <span className="text-2xl font-black text-[#800000] tracking-tight">{OFFICIAL_PG_TABLE.rows.reduce((s, r) => s + r.seats, 0)}</span>
            </div>
          </div>
        </motion.div>

        <div className="mt-6 text-center">
          <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">
            Source: ITM Gwalior official admissions page (itmgoi.in) · Subject to revision per AICTE / RGPV norms
          </p>
        </div>
      </section>

      {/* ── COMPARISON MATRIX ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">At a glance</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            All PG programmes, side-by-side.
          </h2>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#3e0202] to-[#800000] text-white">
                <tr>
                  <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest">Programme</th>
                  <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest">Code</th>
                  <th className="text-center p-4 font-black text-[10px] uppercase tracking-widest">Seats</th>
                  <th className="text-center p-4 font-black text-[10px] uppercase tracking-widest">Duration</th>
                  <th className="text-left p-4 font-black text-[10px] uppercase tracking-widest">Selection</th>
                </tr>
              </thead>
              <tbody>
                {PG_PROGRAMS.map((p, i) => (
                  <tr key={p.id} className={`border-t border-rose-50 dark:border-gray-800 ${i % 2 ? "bg-rose-50/30 dark:bg-gray-900/50" : ""} hover:bg-rose-50 dark:hover:bg-gray-800/50 transition-colors`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProgramIcon
                          name={p.icon}
                          size={18}
                          className="text-[#800000]"
                          wrapClass="w-8 h-8 rounded-lg bg-rose-50 dark:bg-gray-800 flex items-center justify-center shrink-0"
                        />
                        <span className="font-black text-gray-900 dark:text-white tracking-tight">{p.short}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-black uppercase tracking-widest text-gray-500">{p.code}</td>
                    <td className="p-4 text-center font-black text-[#800000]">{p.seats}</td>
                    <td className="p-4 text-center text-xs font-bold text-gray-600 dark:text-gray-400">{p.duration}</td>
                    <td className="p-4 text-xs text-gray-600 dark:text-gray-400 font-medium">{p.selection}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 via-[#3e0202] to-[#800000] text-white p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <Award size={12} /> Ready for the next chapter?
            </span>
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">
              One application. Every PG seat.
            </h3>
            <p className="text-red-100/80 text-sm font-medium max-w-md">
              The DTE Bhopal portal lets you apply to all our PG programmes at once. Our counsellors guide you through stream selection.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/admissions/how-to-apply" className="bg-white text-[#800000] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform">
              Read the application guide
            </Link>
            <a href="https://onlineapply.itmgoi.in/form_hdfc.php?ok=Apply+Now" target="_blank" rel="noreferrer" className="bg-black/30 backdrop-blur text-white border border-white/30 text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-black/50">
              Pay application fee
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
