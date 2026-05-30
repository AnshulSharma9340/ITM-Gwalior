import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  Calendar,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const RESEARCH_SUBNAV = [
  { label: "R&D Cell", to: "/research/rd-cell" },
  { label: "Innovation Ecosystem", to: "/research/innovation-ecosystem" },
  { label: "ITM Journal", to: "/research/journal" },
  { label: "International Conference", to: "/research/conference", active: true },
  { label: "FDP", to: "/research/fdp" },
];

const CONF = {
  name: "International Conference 2025",
  theme: "Bridge the gap between traditional Indian Knowledge Systems and emerging Artificial Intelligence (AI) technologies to foster sustainable global business innovation.",
  dates: "June 25 – 26, 2025",
  earlyBird: "May 30, 2025",
  venue: "Dr. Rammanohar Lohiya Auditorium, Vikram Sarabhai Block, ITM Sithouli Campus, Gwalior (MP)",
  organisingDept: "Department of Management, ITM Gwalior",
  associatedBodies: ["Institution's Innovation Council (IIC)", "IQAC — ITM"],
  submissionEmail: "ic.2025.dom@gmail.com",
};

const TRACKS = [
  { n: 1, title: "AI applications in business and management", icon: "🤖" },
  { n: 2, title: "Integration of Indian Knowledge Systems in modern business", icon: "🪔" },
  { n: 3, title: "Sustainability and ethical AI", icon: "🌱" },
  { n: 4, title: "Digital transformation in global markets", icon: "🌐" },
  { n: 5, title: "Innovation models in the age of disruption", icon: "💡" },
  { n: 6, title: "Policy and education reforms for digital business", icon: "📜" },
];

const ORGANISERS = [
  { name: "Dr. Prashant Sharma", role: "Organising Secretary", phone: "+91-9977213188", accent: "from-rose-500 to-[#800000]" },
  { name: "Ms. Priyanka Verma", role: "Organising Secretary", phone: "+91-8559064853", accent: "from-amber-500 to-orange-600" },
  { name: "Dr. Namrata Chaturvedi", role: "Co-Organising Secretary", phone: "+91-6260936123", accent: "from-emerald-500 to-teal-700" },
  { name: "Ms. Pragya Sikarwar", role: "Co-Organising Secretary", phone: "+91-8120114061", accent: "from-indigo-500 to-violet-700" },
];

const TIMELINE = [
  { date: "May 30, 2025", label: "Early Bird Registration", state: "active" },
  { date: "Jun 15, 2025", label: "Paper Submission Deadline" },
  { date: "Jun 20, 2025", label: "Acceptance Notification" },
  { date: "Jun 25, 2025", label: "Conference Day 1" },
  { date: "Jun 26, 2025", label: "Conference Day 2" },
];

const CONF_GALLERY = [
  "111A8808.JPG", "111A8838.JPG", "111A8847.JPG", "111A8857.JPG",
  "111A8872.JPG", "111A8907.JPG", "111A8914.JPG", "111A8920.JPG",
  "111A8958.JPG", "111A8963.JPG", "111A8974.JPG", "111A9014.JPG",
  "111A9033.JPG", "111A9041.JPG", "111A9049.JPG",
].map((f) => `https://www.itmgoi.in/include/gallery/Conference_Pics/${f}`);

const BROCHURE_URL = "https://www.itmgoi.in/IQAC/Conf_FDP/Brochure_International_Conference.pdf";

export default function ResearchConference() {
  const pageKey = useLocation().pathname;
  const [tab, setTab] = useState("about");

  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5"><Home size={11} /> Home</Link>
          <Crumb size={10} className="text-gray-300" />
          <Link to="/research" className="hover:text-[#800000]">Research</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">International Conference</span>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="bg-gradient-to-r from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {RESEARCH_SUBNAV.map((item) => (
              <Link key={item.label} to={item.to}>
                <span className={`relative shrink-0 px-4 md:px-5 py-3.5 inline-flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${item.active ? "text-white" : "text-rose-100/70 hover:text-white"}`}>
                  {item.label}
                  {item.active && <span className="absolute bottom-0 left-3 right-3 h-1 bg-amber-300 rounded-t-full"></span>}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section data-section="conf_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 md:py-20">
          <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
            <Sparkles size={12} /> Flagship Event · Hybrid Mode
          </span>
          <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-4">
            <EditableText pageKey={pageKey} tkey="conf.title" as="span" value={CONF.name}>{CONF.name}</EditableText>
          </h1>
          <p className="text-base md:text-xl text-rose-100/80 max-w-3xl leading-relaxed font-medium italic mb-6">
            &ldquo;<EditableText pageKey={pageKey} tkey="conf.theme" as="span" multiline value={CONF.theme}>{CONF.theme}</EditableText>&rdquo;
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-black">
              <Calendar size={12} /> {CONF.dates}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-300 text-[#1a0606] rounded-full text-xs font-black">
              Early Bird · {CONF.earlyBird}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-black">
              <MapPin size={12} /> Gwalior, MP
            </span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`mailto:${CONF.submissionEmail}`} className="inline-flex items-center gap-2 bg-white text-[#800000] px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform shadow-xl">
              Submit a paper <ArrowRight size={14} />
            </a>
            <a href="tel:+919977213188" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-white/20">
              <Phone size={13} /> Call Organising Secretary
            </a>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-20">
        <div className="flex items-center justify-center mb-6 sm:mb-10">
          <div className="inline-flex bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-800 rounded-full p-1.5 shadow-sm">
            {[
              { id: "about", label: "About" },
              { id: "tracks", label: "6 Tracks" },
              { id: "team", label: "Organisers" },
              { id: "timeline", label: "Timeline" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`relative px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors ${tab === t.id ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                {tab === t.id && <motion.span layoutId="conf-tab" className="absolute inset-0 bg-[#800000] rounded-full"></motion.span>}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "about" && (
            <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-7 shadow-sm border border-rose-50 dark:border-gray-800">
                <div className="space-y-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2 flex items-center gap-1.5"><MapPin size={11} /> Venue</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed">{CONF.venue}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2 flex items-center gap-1.5"><Users size={11} /> Organising Department</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-bold leading-relaxed">{CONF.organisingDept}</p>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2 flex items-center gap-1.5"><Award size={11} /> Associated Bodies</div>
                    <div className="flex flex-wrap gap-2">
                      {CONF.associatedBodies.map((b) => (
                        <span key={b} className="text-[10px] font-black px-2.5 py-1 bg-rose-50 dark:bg-gray-800 text-[#800000] rounded-full">{b}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-300 to-amber-500 text-[#1a0606] rounded-3xl p-4 sm:p-7 shadow-xl">
                <div className="text-[10px] uppercase tracking-widest font-black mb-2">Paper Submission</div>
                <a href={`mailto:${CONF.submissionEmail}`} className="text-base font-black break-all hover:underline mb-5 block">{CONF.submissionEmail}</a>
                <div className="border-t border-[#1a0606]/20 pt-4">
                  <div className="text-[10px] uppercase tracking-widest font-black mb-1">Early Bird Deadline</div>
                  <div className="text-2xl font-black tracking-tight">{CONF.earlyBird}</div>
                </div>
                <div className="border-t border-[#1a0606]/20 pt-4 mt-4">
                  <a href={BROCHURE_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#1a0606] text-amber-300 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors">
                    <ExternalLink size={11} /> Download Brochure PDF
                  </a>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "tracks" && (
            <motion.div key="tracks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRACKS.map((t, i) => (
                <motion.div key={t.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                  className="relative overflow-hidden bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-widest text-[#800000] bg-rose-50 dark:bg-gray-800 px-2 py-1 rounded">Track {String(t.n).padStart(2, "0")}</div>
                  <div className="text-5xl mb-4">{t.icon}</div>
                  <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight leading-snug">{t.title}</h4>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "team" && (
            <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ORGANISERS.map((o, i) => (
                <motion.div key={o.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -4 }}
                  className="relative overflow-hidden bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className={`h-1.5 bg-gradient-to-r ${o.accent} -mx-6 -mt-6 mb-5`}></div>
                  <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${o.accent} text-white flex items-center justify-center font-black text-base tracking-tight shadow-lg mb-4`}>
                    {o.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="text-[9px] uppercase tracking-widest font-black text-[#800000] mb-1">{o.role}</div>
                  <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight mb-3">{o.name}</h4>
                  <a href={`tel:${o.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 hover:text-[#800000] font-bold">
                    <Phone size={11} /> {o.phone}
                  </a>
                </motion.div>
              ))}
            </motion.div>
          )}

          {tab === "timeline" && (
            <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              {TIMELINE.map((t, i) => (
                <motion.div key={t.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                  className={`flex items-center gap-4 p-5 rounded-2xl ${t.state === "active" ? "bg-gradient-to-r from-amber-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 border-2 border-amber-300 shadow-md" : "bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800"}`}>
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${t.state === "active" ? "bg-amber-300 text-[#1a0606]" : "bg-rose-50 dark:bg-gray-800 text-[#800000]"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1">
                    <div className={`text-[10px] uppercase tracking-widest font-black mb-1 ${t.state === "active" ? "text-amber-700 dark:text-amber-400" : "text-gray-400"}`}>{t.date}</div>
                    <div className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight">{t.label}</div>
                  </div>
                  {t.state === "active" && <span className="text-[9px] font-black uppercase tracking-widest text-amber-700 bg-amber-300 px-2 py-1 rounded-full">Active</span>}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Conference Gallery */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Conference Gallery</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Moments from the conference.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CONF_GALLERY.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl">
                <img src={src} alt={`Conference moment ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white p-4 sm:p-8 md:p-12 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-amber-300 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <BookOpen size={12} /> Register before May 30
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-3">Lock in Early Bird pricing.</h3>
            <p className="text-rose-100/80 text-sm font-medium max-w-md">
              Submit your paper now and benefit from reduced registration before the May 30 deadline.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={`mailto:${CONF.submissionEmail}`} className="bg-amber-300 text-[#1a0606] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2">
              <Mail size={13} /> Submit Paper · {CONF.submissionEmail}
            </a>
            <a href="tel:+919977213188" className="bg-black/30 backdrop-blur text-white border border-white/30 text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-black/50 transition-colors inline-flex items-center justify-center gap-2">
              <Phone size={13} /> Call Dr. Prashant Sharma · +91-9977213188
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
