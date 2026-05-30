import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  CreditCard,
  FileText,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Compass,
  Calendar,
  TrendingUp,
  Award,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import {
  UG_PROGRAMS,
  PG_PROGRAMS,
  ADMISSION_HIGHLIGHTS,
} from "../data/admissions_data";
import EditableText from "../components/admin/EditableText";

const PK = "/admissions"; // page key for edit overrides

// ─── Programme finder wizard ─────────────────────────────────
function recommend({ level, interest }) {
  const all = level === "UG" ? UG_PROGRAMS : PG_PROGRAMS;
  if (level === "UG") {
    const map = {
      computing: ["btech-cse", "btech-aiml", "btech-ds", "btech-cy", "btech-iot", "btech-it", "bca"],
      core: ["btech-ece", "btech-me", "btech-ce", "btech-che"],
      business: ["bba"],
    };
    return all.filter((p) => map[interest]?.includes(p.id));
  }
  const map = {
    computing: ["mtech-cs", "mtech-vlsi", "mca"],
    core: ["mtech-vlsi"],
    business: ["mba"],
  };
  return all.filter((p) => map[interest]?.includes(p.id));
}

const QUICK_LINKS = [
  { title: "UG Programmes", subtitle: "B.Tech · BCA · BBA", body: "12 undergraduate options with stream filter & side-by-side compare.", path: "/admissions/ug", icon: GraduationCap, accent: "from-rose-500 to-red-700" },
  { title: "PG Programmes", subtitle: "M.Tech · MBA · MCA", body: "Interactive explorer with MBA stream picker and entrance score matrix.", path: "/admissions/pg", icon: BookOpen, accent: "from-indigo-500 to-violet-700" },
  { title: "How to Apply", subtitle: "Interactive Guide", body: "Eligibility wizard, fee estimator, document checklist, counsellors.", path: "/admissions/how-to-apply", icon: FileText, accent: "from-amber-500 to-orange-600" },
  { title: "Pay Online", subtitle: "HDFC Gateway", body: "Secure fee payment via UPI, card or netbanking.", href: "https://onlineapply.itmgoi.in/form_hdfc.php?ok=Apply+Now", icon: CreditCard, accent: "from-emerald-500 to-teal-700" },
];

const TIMELINE = [
  { month: "Apr", title: "Applications Open", desc: "Online registrations begin for UG & PG", state: "done" },
  { month: "May", title: "JEE / CMAT Window", desc: "Entrance test scores accepted", state: "active" },
  { month: "Jun", title: "Counselling Begins", desc: "DTE Bhopal merit + off-campus counselling", state: "next" },
  { month: "Jul", title: "Document Verification", desc: "Submission of originals & fee payment" },
  { month: "Aug", title: "Session Commences", desc: "Orientation week and classes begin" },
];

const FAST_FACTS = [
  { value: "DTE Bhopal", label: "Counselling Authority", icon: Compass },
  { value: "₹0", label: "Application Fee", icon: TrendingUp },
  { value: "30 min", label: "Application Time", icon: Briefcase },
  { value: "24h", label: "Reply Window", icon: Award },
];

export default function Admissions() {
  // Programme finder
  const [wiz, setWiz] = useState({ open: false, step: 1, level: null, interest: null });
  const recommendations = useMemo(() => {
    if (!wiz.level || !wiz.interest) return [];
    return recommend(wiz);
  }, [wiz]);

  // Countdown to session start (Aug 1 next academic year)
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const sessionStart = new Date("2026-08-01T09:00:00").getTime();
  const days = Math.max(0, Math.ceil((sessionStart - now) / 86400000));

  const resetWiz = () => setWiz({ open: false, step: 1, level: null, interest: null });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-rose-50/20 to-white dark:from-[#020617] dark:to-[#020617]">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-20 -left-10 w-96 h-96 rounded-full border border-white/40"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <Sparkles size={12} />
              <EditableText pageKey={PK} tkey="hero.badge" as="span" value="Admissions 2026 · Now Open">
                Admissions 2026 · Now Open
              </EditableText>
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight sm:tracking-tighter mb-3 leading-[0.95]">
              <EditableText pageKey={PK} tkey="hero.title" as="span" value="Begin your">Begin your</EditableText> <br />
              <EditableText pageKey={PK} tkey="hero.titleAccent" as="span" className="text-red-200" value="ITM journey.">
                ITM journey.
              </EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium mb-6">
              <EditableText pageKey={PK} tkey="hero.subhead" as="span" multiline value={
                "16 programmes · 1100+ seats · NAAC A · 80%+ placement record · 29 years of legacy. Pick your path or let our finder do it for you."
              }>
                16 programmes · 1100+ seats · NAAC A · 80%+ placement record · 29 years of legacy.
                Pick your path or let our finder do it for you.
              </EditableText>
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setWiz({ open: true, step: 1, level: null, interest: null })}
                className="group inline-flex items-center gap-2 bg-white text-[#800000] px-6 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:shadow-2xl hover:scale-[1.02] transition-all"
              >
                <Compass size={14} className="group-hover:rotate-45 transition-transform" />
                Find My Programme
                <ArrowRight size={14} />
              </button>
              <Link to="/admissions/how-to-apply" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-6 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-white/20 transition-colors">
                Apply Now
              </Link>
            </div>
          </div>

          {/* Countdown card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Until session starts</span>
              </div>
              <div className="text-5xl sm:text-7xl md:text-8xl font-black tracking-[-0.04em] text-white leading-none mb-2">
                {days}
              </div>
              <div className="text-sm font-black uppercase tracking-widest text-rose-100/80">Days to 1 August 2026</div>
              <div className="grid grid-cols-4 gap-2 mt-5 pt-5 border-t border-white/10">
                {ADMISSION_HIGHLIGHTS.slice(0, 4).map((h) => (
                  <div key={h.label} className="text-center">
                    <div className="text-base sm:text-xl font-black tracking-tight text-amber-200">{h.value}</div>
                    <div className="text-[8px] uppercase tracking-widest font-black text-rose-100/70 mt-1 leading-tight">{h.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAST FACTS RIBBON ────────────────────────────── */}
      <section className="border-y border-rose-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 divide-x divide-rose-100 dark:divide-gray-800">
          {FAST_FACTS.map((f) => (
            <div key={f.label} className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-white flex items-center justify-center shrink-0">
                <f.icon size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-base md:text-lg font-black tracking-tight text-[#1a0606] dark:text-white truncate">{f.value}</div>
                <div className="text-[9px] uppercase tracking-widest font-black text-gray-500 mt-0.5">{f.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── QUICK LINKS ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">
                <EditableText pageKey={PK} tkey="quicklinks.eyebrow" as="span" value="Get Started">Get Started</EditableText>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              <EditableText pageKey={PK} tkey="quicklinks.title" as="span" value="Four ways to begin.">Four ways to begin.</EditableText>
            </h2>
          </div>
          <p className="text-sm text-gray-600 max-w-md font-medium leading-relaxed">
            <EditableText pageKey={PK} tkey="quicklinks.intro" as="span" multiline value={
              "Browse programmes, follow the application guide, pay fees online — or use our smart finder."
            }>
              Browse programmes, follow the application guide, pay fees online — or use our smart finder.
            </EditableText>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {QUICK_LINKS.map((q) => {
            const Inner = (
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl transition-shadow cursor-pointer h-full"
              >
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${q.accent} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                <div className={`relative w-12 h-12 rounded-2xl bg-gradient-to-br ${q.accent} flex items-center justify-center text-white shadow-lg mb-5`}>
                  <q.icon size={22} />
                </div>
                <h4 className="font-black text-base tracking-tight text-gray-900 dark:text-white mb-1">{q.title}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#800000] mb-3">{q.subtitle}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium mb-5">{q.body}</p>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#800000] group-hover:gap-3 transition-all">
                  Explore <ArrowRight size={12} />
                </div>
              </motion.div>
            );
            return q.path ? <Link key={q.title} to={q.path}>{Inner}</Link> : <a key={q.title} href={q.href} target="_blank" rel="noreferrer">{Inner}</a>;
          })}
        </div>
      </section>

      {/* ── ADMISSION CALENDAR — interactive timeline ─────── */}
      <section className="bg-gray-50 dark:bg-gray-900/30 py-12 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">
                <EditableText pageKey={PK} tkey="calendar.eyebrow" as="span" value="Admission Calendar">Admission Calendar</EditableText>
              </span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              <EditableText pageKey={PK} tkey="calendar.title" as="span" value="Five stages from April to August.">
                Five stages from April to August.
              </EditableText>
            </h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-9 left-[6%] right-[6%] h-1 bg-gradient-to-r from-emerald-200 via-amber-300 to-rose-200 rounded-full"></div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative"
                >
                  <div className="relative w-16 h-16 mb-4 mx-auto md:mx-0">
                    <div className={`absolute inset-0 rounded-2xl rotate-3 transition-transform ${
                      item.state === "done" ? "bg-gradient-to-br from-emerald-500 to-teal-700" :
                      item.state === "active" ? "bg-gradient-to-br from-amber-400 to-orange-600" :
                      "bg-gradient-to-br from-[#800000] to-[#5a0000]"
                    }`}></div>
                    <div className={`absolute inset-0 bg-white dark:bg-gray-900 border-2 rounded-2xl flex items-center justify-center font-black text-sm tracking-tight ${
                      item.state === "done" ? "border-emerald-500 text-emerald-700" :
                      item.state === "active" ? "border-amber-500 text-amber-700" :
                      "border-[#800000] text-[#800000]"
                    }`}>
                      {item.state === "done" ? <CheckCircle2 size={20} /> : item.month}
                    </div>
                    {item.state === "active" && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-sm text-[#1a0606] dark:text-white mb-1 tracking-tight">{item.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT STRIP ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white p-8 md:p-12 relative">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl"></div>
          <div className="relative grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h3 className="text-2xl md:text-4xl font-black tracking-tighter mb-3">
                <EditableText pageKey={PK} tkey="contact.title" as="span" value="Still have questions?">Still have questions?</EditableText>
              </h3>
              <p className="text-red-100/80 text-sm font-medium mb-6 max-w-lg">
                <EditableText pageKey={PK} tkey="contact.body" as="span" multiline value={
                  "Our admission counsellors are available Mon–Sat, 10am to 5pm. Call, email, or visit campus."
                }>
                  Our admission counsellors are available Mon–Sat, 10am to 5pm. Call, email, or visit campus.
                </EditableText>
              </p>
              <div className="flex flex-wrap gap-5 text-xs font-bold">
                <a href="tel:+917773005065" className="flex items-center gap-2 hover:text-red-200"><Phone size={14} /> +91-7773005065</a>
                <a href="mailto:admission@itmgoi.in" className="flex items-center gap-2 hover:text-red-200"><Mail size={14} /> admission@itmgoi.in</a>
                <span className="flex items-center gap-2 text-red-100/80"><MapPin size={14} /> NH-75 Sithouli, Gwalior</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/admissions/how-to-apply" className="bg-white text-[#800000] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform">
                APPLICATION GUIDE <ChevronRight size={14} className="inline" />
              </Link>
              <a href="http://itmgoi.in/OnlineApply_ITMGOI" target="_blank" rel="noreferrer" className="bg-black/30 backdrop-blur text-white text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl border border-white/30 hover:bg-black/50 transition-colors">
                APPLY ONLINE <ChevronRight size={14} className="inline" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── PROGRAMME FINDER MODAL ─────────── */}
      <AnimatePresence>
        {wiz.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={resetWiz}
            className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white p-6 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 mb-1">Programme Finder</div>
                  <h3 className="text-xl font-black tracking-tight">
                    {wiz.step === 1 ? "What level are you applying for?" :
                     wiz.step === 2 ? "Which area interests you most?" :
                     `Your matches`}
                  </h3>
                </div>
                <button onClick={resetWiz} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center">
                  ✕
                </button>
              </div>

              {/* Progress */}
              <div className="px-6 py-3 border-b border-rose-50 dark:border-gray-800 bg-rose-50/30 dark:bg-gray-800/50">
                <div className="flex gap-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className={`h-1 flex-1 rounded-full ${s <= wiz.step ? "bg-[#800000]" : "bg-rose-100"}`}></div>
                  ))}
                </div>
                <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 mt-1.5">Step {wiz.step} of 3</div>
              </div>

              <div className="p-6 md:p-8 min-h-[300px]">
                {wiz.step === 1 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { id: "UG", label: "Undergraduate", desc: "Just finished 12th · 4-year B.Tech / 3-year BCA-BBA", icon: "🎓" },
                      { id: "PG", label: "Postgraduate", desc: "Graduate or working · M.Tech / MBA / MCA", icon: "📚" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setWiz({ ...wiz, level: o.id, step: 2 })}
                        className="group text-left p-6 rounded-3xl border-2 border-rose-50 dark:border-gray-700 hover:border-[#800000] hover:shadow-xl transition-all bg-white dark:bg-gray-800"
                      >
                        <div className="text-4xl mb-3">{o.icon}</div>
                        <div className="font-black text-lg text-[#1a0606] dark:text-white tracking-tight mb-1">{o.label}</div>
                        <div className="text-xs text-gray-500 font-medium">{o.desc}</div>
                        <div className="mt-4 text-[10px] font-black uppercase tracking-widest text-[#800000] inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          Continue <ArrowRight size={12} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {wiz.step === 2 && (
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { id: "computing", label: "Computing & Software", desc: "CSE, IT, AI/ML, Data Science, Cyber, IoT, MCA", icon: "💻" },
                      { id: "core", label: "Core Engineering", desc: "ECE, Mechanical, Civil, Chemical, VLSI", icon: "⚙️" },
                      { id: "business", label: "Business & Management", desc: "BBA, MBA (Marketing/Finance/HR)", icon: "📈" },
                    ].map((o) => (
                      <button
                        key={o.id}
                        onClick={() => setWiz({ ...wiz, interest: o.id, step: 3 })}
                        className="group text-left p-5 rounded-3xl border-2 border-rose-50 dark:border-gray-700 hover:border-[#800000] hover:shadow-xl transition-all bg-white dark:bg-gray-800"
                      >
                        <div className="text-3xl mb-2">{o.icon}</div>
                        <div className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight mb-1">{o.label}</div>
                        <div className="text-[10px] text-gray-500 font-medium leading-relaxed">{o.desc}</div>
                      </button>
                    ))}
                  </div>
                )}

                {wiz.step === 3 && (
                  <div>
                    {recommendations.length === 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        <p className="font-black uppercase tracking-widest">No exact match — try a different combination</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-5">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={11} /> {recommendations.length} matching programme{recommendations.length !== 1 ? "s" : ""}
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                          {recommendations.map((p) => (
                            <div key={p.id} className="bg-rose-50/40 dark:bg-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="text-3xl">{p.icon}</div>
                                <span className="text-[9px] uppercase tracking-widest font-black text-[#800000] bg-white dark:bg-gray-700 px-2 py-0.5 rounded">
                                  {p.code}
                                </span>
                              </div>
                              <div className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug mb-2">{p.short}</div>
                              <div className="text-[10px] text-gray-600 dark:text-gray-400 font-bold">{p.seats} seats · {p.duration}</div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-rose-50 dark:border-gray-800 bg-rose-50/30 dark:bg-gray-800/50 flex items-center justify-between">
                <button
                  onClick={() => wiz.step > 1 ? setWiz({ ...wiz, step: wiz.step - 1 }) : resetWiz()}
                  className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-600 hover:text-[#800000]"
                >
                  <ChevronLeft size={14} /> {wiz.step === 1 ? "Cancel" : "Back"}
                </button>
                {wiz.step === 3 && recommendations.length > 0 && (
                  <Link to={wiz.level === "UG" ? "/admissions/ug" : "/admissions/pg"} onClick={resetWiz} className="inline-flex items-center gap-2 bg-[#800000] text-white px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-red-900">
                    View full details <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
