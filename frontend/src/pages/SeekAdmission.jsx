import React, { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, AnimatePresence } from "framer-motion";
import AdmissionInquiryForm from "../components/AdmissionInquiryForm";
import {
  FileText,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Calculator,
  Award,
  PercentCircle,
  Building2,
  Clock,
  AlertCircle,
  // Added for dynamic program icons mapping:
  Monitor,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  Globe,
  Network,
  Radio,
  Cog,
  FlaskConical,
  Code2,
  Briefcase,
  GraduationCap,
  Cpu,
  TrendingUp,
} from "lucide-react";
import {
  ADMISSION_STEPS,
  REQUIRED_DOCS,
  COUNSELLORS,
  ADMISSION_FAQ,
  SELECTION_PROCESS,
  QUOTAS,
  FEE_COMPONENTS,
  UG_PROGRAMS,
  PG_PROGRAMS,
} from "../data/admissions_data";

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
  GraduationCap,
  Cpu,
  TrendingUp,
};

/** Renders a Lucide icon with optional wrapping container */
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

// ─── Eligibility wizard logic ────────────────────────────────────────
function matchPrograms({ level, stream, percent, category }) {
  const minPct = category === "general" ? 45 : 40;
  const pgMin = 50;
  if (percent < (level === "PG" ? pgMin : minPct)) return [];

  if (level === "UG") {
    if (stream === "PCM") return UG_PROGRAMS;
    if (stream === "any-stream") return UG_PROGRAMS.filter((p) => p.code !== "B.TECH");
  }
  if (level === "PG") {
    if (stream === "engineering") return PG_PROGRAMS.filter((p) => p.code.startsWith("M.TECH"));
    if (stream === "graduate-maths") return PG_PROGRAMS.filter((p) => ["MCA", "MBA"].includes(p.code));
    if (stream === "any-graduate") return PG_PROGRAMS.filter((p) => p.code === "MBA");
  }
  return [];
}

export default function SeekAdmission() {
  const pageKey = useLocation().pathname;
  const [activeStep, setActiveStep] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);
  const [counsellorFilter, setCounsellorFilter] = useState("All");

  // Eligibility wizard state
  const [wiz, setWiz] = useState({ level: "UG", stream: "PCM", percent: 75, category: "general" });
  const matches = useMemo(() => matchPrograms(wiz), [wiz]);

  // Fee estimator state
  const [feeChoice, setFeeChoice] = useState({ programme: "btech", hostel: true, years: 4 });
  const feeTotal = useMemo(() => {
    const programme = feeChoice.programme;
    const tuitionPerYear = programme === "btech" ? 95000 : 80000;
    const hostelPerYear = feeChoice.hostel ? 65000 : 0;
    const examPerYear = 8000;
    const oneTime = 10000;
    return tuitionPerYear * feeChoice.years + hostelPerYear * feeChoice.years + examPerYear * feeChoice.years + oneTime;
  }, [feeChoice]);

  const formatINR = (n) => `₹ ${n.toLocaleString("en-IN")}`;

  const programmes = ["All", ...new Set(COUNSELLORS.map((c) => c.programme))];
  const filteredCounsellors =
    counsellorFilter === "All" ? COUNSELLORS : COUNSELLORS.filter((c) => c.programme === counsellorFilter);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/20 to-white dark:from-[#020617] dark:to-[#020617]">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section data-section="seek_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-20 right-32 w-64 h-64 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 rounded-full border border-white/40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <Link
              to="/admissions"
              className="text-[10px] font-black uppercase tracking-widest text-red-200 hover:text-white inline-flex items-center gap-1 mb-3"
            >
              ← Admissions
            </Link>
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <Sparkles size={12} /> Admissions 2026 — Now Open
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.95] mb-3">
              <EditableText pageKey={pageKey} tkey="seek.title.line1" as="span" value="Apply to ITM.">Apply to ITM.</EditableText><br />
              <EditableText pageKey={pageKey} tkey="seek.title.line2" as="span" value="The smart way." className="text-red-200">The smart way.</EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-2xl leading-relaxed font-medium mb-6">
              <EditableText pageKey={pageKey} tkey="seek.intro" as="span" multiline
                value="Check your eligibility, estimate your fees, find the right counsellor — all in one place. No PDFs to download, no phone tag.">
                Check your eligibility, estimate your fees, find the right counsellor — all in one place.
                No PDFs to download, no phone tag.
              </EditableText>
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#wizard"
                className="inline-flex items-center gap-2 bg-white text-[#800000] px-6 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform"
              >
                Check My Eligibility <ArrowRight size={14} />
              </a>
              <a
                href="http://itmgoi.in/OnlineApply_ITMGOI"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-white/20 transition-colors"
              >
                Open Application Portal <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Quota distribution gauge */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <PercentCircle size={14} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">
                Seat Distribution
              </span>
            </div>
            <div className="space-y-3">
              {QUOTAS.map((q) => (
                <div key={q.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-black tracking-tight">{q.name}</span>
                    <span className="font-black tracking-tight text-amber-300">{q.pct}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${q.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-amber-300 to-rose-200 rounded-full"
                    />
                  </div>
                  <div className="text-[9px] mt-1 text-rose-100/70 font-medium">{q.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── INTERACTIVE ELIGIBILITY WIZARD ─────────── */}
      <section id="wizard" className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 mb-3">
            <Sparkles size={12} className="text-[#800000]" />
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">
              Interactive Tool · No Signup
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Find programmes you{" "}
            <span className="bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent">
              qualify for.
            </span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 font-medium">
            Answer four quick questions. We&apos;ll show you every ITM programme you can apply for.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-32 bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl p-7">

              {/* Level */}
              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">
                  Level you&apos;re applying for
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["UG", "PG"].map((l) => (
                    <button
                      key={l}
                      onClick={() => setWiz({ ...wiz, level: l, stream: l === "UG" ? "PCM" : "engineering" })}
                      className={`relative py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors ${
                        wiz.level === l
                          ? "bg-[#800000] text-white shadow-lg"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {l === "UG" ? "Undergraduate" : "Postgraduate"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream */}
              <div className="mb-6">
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">
                  Your background
                </label>
                <div className="flex flex-col gap-2">
                  {wiz.level === "UG"
                    ? [
                        { id: "PCM", label: "10+2 with Physics, Chem, Math" },
                        { id: "any-stream", label: "10+2 any stream (BBA / BCA)" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setWiz({ ...wiz, stream: s.id })}
                          className={`text-left p-3 rounded-2xl border-2 transition-all ${
                            wiz.stream === s.id
                              ? "border-[#800000] bg-rose-50 dark:bg-[#800000]/30"
                              : "border-gray-100 dark:border-gray-800 hover:border-rose-200"
                          }`}
                        >
                          <div className="text-sm font-black text-[#1a0606] dark:text-white">{s.label}</div>
                        </button>
                      ))
                    : [
                        { id: "engineering", label: "B.E. / B.Tech in Engineering (M.Tech)" },
                        { id: "graduate-maths", label: "Graduate with Maths at 12th (MCA / MBA)" },
                        { id: "any-graduate", label: "Any graduate, 50%+ (MBA)" },
                      ].map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setWiz({ ...wiz, stream: s.id })}
                          className={`text-left p-3 rounded-2xl border-2 transition-all ${
                            wiz.stream === s.id
                              ? "border-[#800000] bg-rose-50 dark:bg-[#800000]/30"
                              : "border-gray-100 dark:border-gray-800 hover:border-rose-200"
                          }`}
                        >
                          <div className="text-sm font-black text-[#1a0606] dark:text-white">{s.label}</div>
                        </button>
                      ))}
                </div>
              </div>

              {/* Percent slider */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#800000]">
                    {wiz.level === "UG" ? "Class 12th %" : "Graduation %"}
                  </label>
                  <span className="text-2xl font-black tracking-tighter text-[#800000]">{wiz.percent}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={wiz.percent}
                  onChange={(e) => setWiz({ ...wiz, percent: Number(e.target.value) })}
                  className="w-full accent-[#800000]"
                />
                <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold text-gray-400 mt-1">
                  <span>30%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "general", label: "General" },
                    { id: "reserved", label: "SC / ST / OBC" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setWiz({ ...wiz, category: c.id })}
                      className={`py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-colors ${
                        wiz.category === c.id
                          ? "bg-[#800000] text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-[#1a0606] dark:text-white">
                  {matches.length > 0 ? `${matches.length} programme${matches.length !== 1 ? "s" : ""} for you` : "No matches"}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Based on your inputs · live filter</p>
              </div>
              {matches.length > 0 && (
                <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={12} /> Eligible
                </span>
              )}
            </div>

            {matches.length === 0 ? (
              <div className="bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-gray-700 rounded-3xl p-8 text-center">
                <AlertCircle size={32} className="mx-auto text-amber-700 mb-3" />
                <h4 className="font-black text-base text-amber-900 dark:text-amber-300 mb-2">
                  Your inputs don&apos;t match the minimum cutoff.
                </h4>
                <p className="text-sm text-amber-800 dark:text-amber-400 font-medium">
                  Try increasing your percentage, or call our counsellors below — special quotas may apply.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                <AnimatePresence>
                  {matches.map((p, i) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-rose-50 dark:border-gray-800 hover:border-[#800000] hover:shadow-xl transition-all p-5"
                    >
                      <div className={`absolute top-0 left-5 right-5 h-1 bg-gradient-to-r ${p.accent} rounded-b-full`}></div>
                      <div className="flex items-start justify-between mb-3 mt-1">
                        <ProgramIcon
                          name={p.icon}
                          size={24}
                          className="text-[#800000] dark:text-rose-200"
                          wrapClass="w-10 h-10 rounded-xl bg-rose-50 dark:bg-gray-800 flex items-center justify-center"
                        />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded">
                          {p.code}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-gray-900 dark:text-white tracking-tight leading-snug mb-3">
                        {p.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[9px] uppercase tracking-widest font-black px-2 py-1 bg-rose-50 text-[#800000] dark:bg-rose-950/40 dark:text-rose-300 rounded">
                          {p.seats} seats
                        </span>
                        <span className="text-[9px] uppercase tracking-widest font-black px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded">
                          {p.duration}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {matches.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                <a
                  href="http://itmgoi.in/OnlineApply_ITMGOI"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#800000] text-white px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-red-900 transition-colors"
                >
                  Start Application <ArrowRight size={12} />
                </a>
                <a
                  href="#fees"
                  className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Calculator size={12} /> Estimate Fees
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─────────── SELECTION PROCESS ─────────── */}
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
              <Award size={12} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                DTE Bhopal Counselling
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-3">
              The selection process,{" "}
              <span className="bg-gradient-to-r from-amber-300 to-rose-200 bg-clip-text text-transparent">
                stream by stream.
              </span>
            </h2>
            <p className="text-sm text-rose-100/70 font-medium">
              Every ITM admission goes through state-level counselling. Here&apos;s exactly how it works for each programme.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {SELECTION_PROCESS.map((sp, i) => (
              <motion.div
                key={sp.code}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative overflow-hidden bg-white/[0.04] backdrop-blur border border-white/10 rounded-3xl p-6 hover:bg-white/[0.06] transition-colors"
              >
                <div className={`absolute top-0 left-6 right-6 h-1 bg-gradient-to-r ${sp.accent} rounded-b-full`}></div>

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sp.accent} flex items-center justify-center text-white font-black tracking-tight shadow-lg shrink-0`}>
                    {sp.code[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-base tracking-tight">{sp.code}</h3>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-amber-300/80">{sp.duration}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">Eligibility</div>
                    <p className="text-white/85 leading-relaxed font-medium">{sp.eligibility}</p>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">Selection</div>
                    <p className="text-white/85 leading-relaxed font-medium">{sp.selection}</p>
                  </div>
                  {sp.streams && (
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">Streams</div>
                      <div className="flex flex-wrap gap-1.5">
                        {sp.streams.map((s) => (
                          <span key={s} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-amber-300/20 text-amber-200 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {sp.lateral && (
                    <div className="text-xs text-emerald-300/90 font-medium pt-2 border-t border-white/10">
                      💡 {sp.lateral}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── STEPPER ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">The Six Steps</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            From application to admission letter.
          </h2>
        </div>

        {/* Desktop stepper */}
        <div className="hidden lg:flex items-center justify-between mb-10 relative">
          <div className="absolute top-7 left-[6%] right-[6%] h-0.5 bg-gradient-to-r from-rose-200 via-[#800000] to-rose-200"></div>
          {ADMISSION_STEPS.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className="relative flex flex-col items-center group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${
                  activeStep === s.step
                    ? "bg-[#800000] text-white shadow-xl"
                    : activeStep > s.step
                    ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-700"
                    : "bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700"
                }`}
              >
                {activeStep > s.step ? <CheckCircle2 size={22} /> : s.step}
              </motion.div>
              <div className={`mt-3 text-[10px] font-black uppercase tracking-widest text-center max-w-[100px] leading-tight transition-colors ${
                activeStep === s.step ? "text-[#800000]" : "text-gray-400 group-hover:text-gray-600"
              }`}>{s.title}</div>
            </button>
          ))}
        </div>

        {/* Active step card */}
        <AnimatePresence mode="wait">
          {ADMISSION_STEPS.map(
            (s) =>
              s.step === activeStep && (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="relative overflow-hidden bg-gradient-to-br from-white to-rose-50/20 dark:from-gray-900 dark:to-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl p-8 md:p-10 grid md:grid-cols-5 gap-8"
                >
                  <div className="md:col-span-2 flex flex-col items-center md:items-start gap-4">
                    <div className="text-7xl">{s.icon}</div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-1">
                        Step {s.step} of {ADMISSION_STEPS.length}
                      </div>
                      <h3 className="font-black text-2xl md:text-3xl tracking-tight text-[#1a0606] dark:text-white leading-tight">
                        {s.title}
                      </h3>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium mb-6">{s.body}</p>
                    <div className="flex flex-wrap gap-2">
                      {s.action && (
                        <a
                          href={s.action.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-[#800000] text-white px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-red-900"
                        >
                          <ExternalLink size={12} /> {s.action.label}
                        </a>
                      )}
                      <button
                        onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
                        disabled={activeStep === 1}
                        className="px-4 py-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black text-xs tracking-widest disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-700"
                      >← PREV</button>
                      <button
                        onClick={() => setActiveStep(Math.min(ADMISSION_STEPS.length, activeStep + 1))}
                        disabled={activeStep === ADMISSION_STEPS.length}
                        className="px-4 py-3 rounded-full bg-gray-900 text-white font-black text-xs tracking-widest disabled:opacity-40"
                      >NEXT →</button>
                    </div>
                  </div>
                </motion.div>
              )
          )}
        </AnimatePresence>
      </section>

      {/* ─────────── FEE ESTIMATOR ─────────── */}
      <section id="fees" className="bg-gray-50 dark:bg-gray-900/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-gray-800 border border-amber-200 dark:border-gray-700 mb-3">
              <Calculator size={12} className="text-amber-700 dark:text-amber-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-700">
                Fee Estimator
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Plan your total spend in 10 seconds.
            </h2>
            <p className="text-xs text-gray-500 mt-3 font-medium">
              Indicative figures · final fees vary by programme & year · confirm with admission office.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl p-7">

                <div className="mb-5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">
                    Programme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "btech", label: "B.Tech" },
                      { id: "mtech", label: "M.Tech" },
                      { id: "mba", label: "MBA" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setFeeChoice({ ...feeChoice, programme: p.id, years: p.id === "btech" ? 4 : 2 })}
                        className={`py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition ${
                          feeChoice.programme === p.id ? "bg-[#800000] text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >{p.label}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">
                    Duration · {feeChoice.years} years
                  </label>
                  <input
                    type="range"
                    min={feeChoice.programme === "btech" ? 3 : 1}
                    max={feeChoice.programme === "btech" ? 4 : 2}
                    value={feeChoice.years}
                    onChange={(e) => setFeeChoice({ ...feeChoice, years: Number(e.target.value) })}
                    className="w-full accent-[#800000]"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-rose-50 dark:bg-gray-800 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={feeChoice.hostel}
                    onChange={(e) => setFeeChoice({ ...feeChoice, hostel: e.target.checked })}
                    className="w-5 h-5 accent-[#800000]"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-black text-[#1a0606] dark:text-white">Include hostel + mess</div>
                    <div className="text-[10px] text-gray-500 font-medium">₹ 65,000 / year</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative overflow-hidden bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white rounded-3xl shadow-2xl p-8">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-amber-500/30 blur-2xl"></div>

                <div className="relative">
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-2">Estimated Total</div>
                  <div className="text-5xl md:text-6xl font-black tracking-[-0.04em] mb-1">
                    {formatINR(feeTotal)}
                  </div>
                  <div className="text-xs text-rose-100/70 font-medium mb-6">
                    Over {feeChoice.years} year{feeChoice.years > 1 ? "s" : ""} ·{" "}
                    {feeChoice.hostel ? "with" : "without"} hostel · indicative
                  </div>

                  <div className="space-y-2.5 pt-6 border-t border-white/10">
                    {FEE_COMPONENTS.map((c) => (
                      <div key={c.item} className="flex items-center justify-between text-sm">
                        <span className="text-rose-100/80 font-medium">{c.item}</span>
                        <span className="font-black text-amber-200 tracking-tight">
                          {feeChoice.programme === "btech" ? c.btech : feeChoice.programme === "mtech" ? c.mtech : c.mba}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 px-3 py-2 bg-white/10 rounded-full text-[10px] uppercase tracking-widest font-black text-amber-300">
                    💡 Scholarships can cover up to 100% — check eligibility
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── DOCUMENT CHECKLIST ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Checklist</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05] mb-4">
              What to keep ready.
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed mb-6">
              Scan each document as PDF or JPG, under 2 MB. Originals are needed only at verification.
            </p>

            <a
              href="http://itmgoi.in/OnlineApply_ITMGOI"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#800000] text-white px-5 py-3 rounded-2xl font-black text-xs tracking-widest hover:bg-red-900 transition-colors"
            >
              <FileText size={14} /> Open Application Form
            </a>
          </div>

          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-2">
            {REQUIRED_DOCS.map((doc, i) => (
              <motion.label
                key={doc}
                initial={{ opacity: 0, x: 10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-900 rounded-2xl border border-rose-50 dark:border-gray-800 hover:border-[#800000] cursor-pointer transition-colors group"
              >
                <input type="checkbox" className="peer hidden" />
                <div className="w-6 h-6 rounded-md border-2 border-gray-300 peer-checked:border-[#800000] peer-checked:bg-[#800000] flex items-center justify-center transition-colors shrink-0">
                  <CheckCircle2 size={12} className="text-white opacity-0 peer-checked:opacity-100" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 peer-checked:line-through peer-checked:text-gray-400 leading-relaxed">
                  {doc}
                </span>
              </motion.label>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── COUNSELLORS ─────────── */}
      <section className="bg-gray-50 dark:bg-gray-900/30 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Get In Touch</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
                Talk to a real counsellor.
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {programmes.map((p) => (
                <button
                  key={p}
                  onClick={() => setCounsellorFilter(p)}
                  className={`shrink-0 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                    counsellorFilter === p
                      ? "bg-[#800000] text-white shadow-md"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCounsellors.map((c, i) => (
              <motion.div
                key={`${c.name}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{c.icon}</div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#800000] bg-rose-50 dark:bg-gray-800 px-2 py-1 rounded">
                    {c.programme}
                  </span>
                </div>

                <h4 className="font-black text-lg text-[#1a0606] dark:text-white tracking-tight mb-4">
                  {c.name}
                </h4>

                <div className="flex flex-col gap-2.5">
                  <a href={`tel:${c.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#800000] transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-gray-800 text-[#800000] flex items-center justify-center group-hover:bg-[#800000] group-hover:text-white transition-colors">
                      <Phone size={12} />
                    </div>
                    {c.phone}
                  </a>
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#800000]">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-gray-800 text-[#800000] flex items-center justify-center group-hover:bg-[#800000] group-hover:text-white transition-colors">
                      <Mail size={12} />
                    </div>
                    {c.email}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FAQ ─────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">FAQ</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05] mb-10">
          Frequently asked questions.
        </h2>

        <div className="flex flex-col gap-3">
          {ADMISSION_FAQ.map((f, i) => {
            const open = openFaq === i;
            return (
              <motion.div
                key={f.q}
                layout
                className={`overflow-hidden rounded-2xl border-2 transition-colors ${
                  open ? "bg-white dark:bg-gray-900 border-[#800000] shadow-lg" : "bg-white/60 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800"
                }`}
              >
                <button onClick={() => setOpenFaq(open ? -1 : i)} className="w-full text-left p-5 md:p-6 flex items-center justify-between gap-4">
                  <span className="font-black text-sm md:text-base text-gray-900 dark:text-white tracking-tight">{f.q}</span>
                  <motion.div animate={{ rotate: open ? 180 : 0 }} className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${open ? "bg-[#800000] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <ChevronDown size={14} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-5 md:px-6 pb-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{f.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─────────── VISIT CAMPUS (preserved) ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
          <div className="grid md:grid-cols-2">
            <div className="p-8 md:p-12">
              <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
                <MapPin size={12} /> Visit Campus
              </span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-3 leading-tight">
                Walk the campus.<br />Meet the faculty.
              </h3>
              <p className="text-red-100/80 text-sm font-medium mb-8 max-w-md">
                Walk-in counselling Mon–Sat, 10am–5pm. Carry mark-sheets and any one ID proof.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0"><MapPin size={16} /></div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-200 mb-0.5">Address</div>
                    <div className="text-sm font-bold">NH-75 Sithouli, Jhansi Road,<br />Gwalior – 475001, M.P., INDIA</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0"><Phone size={16} /></div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-200 mb-0.5">Phone</div>
                    <div className="text-sm font-bold">+91-7773005065 · +91-7773001624</div>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="https://maps.google.com/?q=ITM+Gwalior+Sithouli" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-[#800000] px-5 py-3 rounded-full font-black text-xs tracking-widest hover:scale-[1.02] transition-transform">
                  <MapPin size={12} /> Open in Maps
                </a>
              </div>
            </div>
            <div className="relative min-h-[300px] bg-black/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3582.6486!2d78.1828!3d26.143!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjbCsDA4JzM0LjgiTiA3OMKwMTAnNTcuOSJF!5e0!3m2!1sen!2sin!4v1700000000000"
                title="ITM Gwalior Map"
                width="100%" height="100%"
                style={{ border: 0, minHeight: 300 }}
                allowFullScreen loading="lazy"
                className="grayscale-[20%] opacity-90"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* ── Live inquiry form (Phase 7) ─────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white dark:bg-[#020617]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1a0606] dark:text-white">
              Quick admissions enquiry
            </h2>
            <p className="text-sm text-gray-500 mt-2">A counsellor will reach out within 24 hours.</p>
          </div>
          <AdmissionInquiryForm />
        </div>
      </section>
    </div>
  );
}
