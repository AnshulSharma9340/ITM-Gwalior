import React from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  BookOpen,
  ExternalLink,
  ArrowRight,
  ArrowUpRight,
  Mail,
  FileText,
  CheckCircle2,
  Award,
  Globe,
  Users,
  Layers,
} from "lucide-react";

const RESEARCH_SUBNAV = [
  { label: "R&D Cell", to: "/research/rd-cell" },
  { label: "Innovation Ecosystem", to: "/research/innovation-ecosystem" },
  { label: "ITM Journal", to: "/research/journal", active: true },
  { label: "International Conference", to: "/research/conference" },
  { label: "FDP", to: "/research/fdp" },
];

const SCOPE_TOPICS = [
  { icon: "💻", title: "Computer Science", desc: "AI, ML, Data Science, Blockchain, Cloud Computing, Cyber Security." },
  { icon: "📡", title: "Electronics", desc: "VLSI, embedded systems, signal processing, IoT, communication." },
  { icon: "🏗️", title: "Civil Engineering", desc: "Structural engg., sustainable concrete, infrastructure health." },
  { icon: "⚙️", title: "Mechanical Engg.", desc: "Manufacturing, robotics, materials, energy systems." },
  { icon: "🧪", title: "Basic Sciences", desc: "Optoelectronics, material sciences, environmental sustainability." },
  { icon: "📈", title: "Management", desc: "Financial analytics, HR, marketing, organisational behaviour." },
];

const FEATURES = [
  { icon: CheckCircle2, title: "Peer-reviewed", body: "Double-blind peer review by domain experts before acceptance." },
  { icon: Globe, title: "Open Access", body: "All accepted papers freely available online — maximum reach." },
  { icon: Users, title: "Cross-disciplinary", body: "Engineering · Management · Sciences across all departments." },
  { icon: Award, title: "Indexed", body: "Listed in major academic indexing services for citations." },
];

const SUBMISSION_STEPS = [
  { n: 1, title: "Prepare Manuscript", body: "Follow the IEEE / APA template specified in author guidelines." },
  { n: 2, title: "Submit via Portal", body: "Upload through iijisem.com submission system or email editor@iijisem.com." },
  { n: 3, title: "Peer Review", body: "Double-blind review — acceptance notification within 20 days of submission." },
  { n: 4, title: "Revise & Publish", body: "Incorporate reviewer feedback, then published within 30 days post-review." },
];

const ISSN = "2581-6020";
const MANAGING_EDITOR = {
  name: "Dr. Deepesh Bhardwaj",
  quals: "M.Tech., M.Phil., Ph.D.",
  role: "Dean R&D, ITM Gwalior",
};
const EDITORIAL_BOARD = [
  "Prof. (Dr.) S. S. Chauhan", "Rishi Soni", "Aditya Vidhyarthi",
  "Preeti Singh", "Manoj Mishra", "Rajeev Singh", "Manoj Sharma",
  "A. S. Trivedi", "Dr. Pradeep Yadav", "Dr. Jitendra Singh Kushwah", "Dr. Deepak Gupta",
];
const VOLUMES = [
  { label: "Vol 02, Issue 01", period: "January – June 2025", latest: true },
  { label: "Vol 01, Issue 02", period: "July – December 2024", latest: false },
  { label: "Vol 01, Issue 01", period: "January – June 2024", latest: false },
];

export default function ResearchJournal() {
  const pageKey = useLocation().pathname;
  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5"><Home size={11} /> Home</Link>
          <Crumb size={10} className="text-gray-300" />
          <Link to="/research" className="hover:text-[#800000]">Research</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">ITM Journal</span>
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
      <section data-section="journal_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 md:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <BookOpen size={12} /> Peer-Reviewed Publication
            </span>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-4">
              <EditableText pageKey={pageKey} tkey="journal.title.line1" as="span" value="ITM International">ITM International</EditableText><br />
              <EditableText pageKey={pageKey} tkey="journal.title.line2" as="span" value="Journal." className="text-red-200">Journal.</EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium mb-6">
              <EditableText pageKey={pageKey} tkey="journal.intro" as="span" multiline
                value="IIJISEM — our peer-reviewed open-access publication featuring innovative research in Science, Engineering & Management.">
                IIJISEM — our peer-reviewed open-access publication featuring innovative research in
                Science, Engineering &amp; Management.
              </EditableText>
            </p>
            <a href="https://iijisem.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-[#800000] px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform shadow-xl">
              Visit iijisem.com <ExternalLink size={14} />
            </a>
          </div>

          {/* Big journal-cover mockup */}
          <div className="lg:col-span-5">
            <motion.div initial={{ rotate: -3, opacity: 0 }} animate={{ rotate: 3, opacity: 1 }} transition={{ duration: 0.6 }} className="relative aspect-[3/4] max-w-sm mx-auto">
              <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl rotate-3"></div>
              <div className="relative bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] rounded-3xl h-full p-8 flex flex-col justify-between border-4 border-white shadow-2xl">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.3em] font-black text-amber-300 mb-2">IIJISEM · ISSN {ISSN}</div>
                  <h3 className="text-2xl font-black tracking-[-0.03em] leading-tight">ITM International Journal of Innovation in Science, Engineering &amp; Management</h3>
                </div>
                <div>
                  <div className="h-px bg-amber-300 w-12 mb-4"></div>
                  <div className="text-[10px] uppercase tracking-widest font-black text-amber-300">Peer Reviewed · Open Access</div>
                  <div className="text-xs font-bold text-rose-100/80 mt-1">Published by ITM Gwalior</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Why publish with IIJISEM</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            A serious research outlet — at your fingertips.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6 hover:shadow-xl transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-white flex items-center justify-center mb-4"><f.icon size={20} /></div>
              <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight mb-2">{f.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scope */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Scope</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Six domains. One journal.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCOPE_TOPICS.map((t, i) => (
              <motion.div key={t.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-gradient-to-br from-white dark:from-gray-900 to-rose-50/40 dark:to-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6">
                <div className="text-4xl mb-3">{t.icon}</div>
                <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight mb-2">{t.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Published Issues */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-20">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Published Issues</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Volumes &amp; issues.
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {VOLUMES.map((v) => (
            <a key={v.label} href="https://iijisem.com" target="_blank" rel="noreferrer"
              className={`group relative overflow-hidden rounded-3xl p-3 sm:p-6 hover:shadow-2xl transition-shadow ${v.latest ? "bg-gradient-to-br from-[#3e0202] to-[#800000] text-white" : "bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800"}`}>
              {v.latest && <span className="absolute top-4 right-4 text-[9px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-300 text-[#1a0606] rounded">Latest</span>}
              <Layers size={22} className={`mb-3 ${v.latest ? "text-amber-300" : "text-[#800000]"}`} />
              <div className={`text-xl font-black tracking-tight mb-1 ${v.latest ? "text-amber-200" : "text-[#800000]"}`}>{v.label}</div>
              <div className={`text-[10px] uppercase tracking-widest font-black ${v.latest ? "text-white/80" : "text-gray-500"}`}>{v.period}</div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black group-hover:gap-3 transition-all">
                View Issue <ArrowUpRight size={11} />
              </div>
            </a>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6 font-medium">
          Biannual publication · Acceptance within 20 days · Email: <a href="mailto:editor@iijisem.com" className="text-[#800000] hover:underline">editor@iijisem.com</a> · <a href="mailto:support@iijisem.com" className="text-[#800000] hover:underline">support@iijisem.com</a>
        </p>
      </section>

      {/* Editorial Board */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Editorial Leadership</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Managing Editor &amp; Editorial Board
            </h2>
          </div>
          <div className="mb-8 max-w-xs mx-auto">
            <div className="bg-gradient-to-br from-[#3e0202] to-[#800000] text-white rounded-3xl p-3 sm:p-6 text-center shadow-xl">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-lg mx-auto mb-4">DB</div>
              <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">Managing Editor</div>
              <h3 className="font-black text-base tracking-tight mb-1">{MANAGING_EDITOR.name}</h3>
              <p className="text-[10px] text-rose-100/80">{MANAGING_EDITOR.quals}</p>
              <p className="text-[10px] text-amber-300 font-bold mt-1">{MANAGING_EDITOR.role}</p>
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-4 text-center">Editorial Board · {EDITORIAL_BOARD.length} members</div>
          <div className="flex flex-wrap justify-center gap-2">
            {EDITORIAL_BOARD.map((name) => (
              <span key={name} className="px-3 py-1.5 bg-rose-50 dark:bg-gray-800 text-[#1a0606] dark:text-white text-xs font-bold rounded-full border border-rose-100 dark:border-gray-700">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Submission process */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Submission Process</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Four steps from manuscript to publication.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-rose-200 via-[#800000] to-rose-200"></div>
          {SUBMISSION_STEPS.map((s, i) => (
            <motion.div key={s.n} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="relative bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6 text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#800000] to-[#5a0000] rounded-2xl rotate-3"></div>
                <div className="absolute inset-0 bg-white dark:bg-gray-900 border-2 border-[#800000] rounded-2xl flex items-center justify-center text-2xl font-black tracking-tight text-[#800000]">
                  {String(s.n).padStart(2, "0")}
                </div>
              </div>
              <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight mb-2">{s.title}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Visit journal CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <a href="https://iijisem.com" target="_blank" rel="noreferrer"
          className="group block relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white p-4 sm:p-8 md:p-12 hover:shadow-2xl transition-shadow">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-amber-500/30 blur-2xl"></div>
          <div className="relative grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-amber-300/20 border border-amber-300/30 rounded-full mb-3">
                <FileText size={11} className="text-amber-300" />
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Visit the Journal</span>
              </span>
              <h3 className="text-xl sm:text-2xl md:text-4xl font-black tracking-[-0.03em] mb-2">
                Read current issue · Submit a paper.
              </h3>
              <p className="text-sm md:text-base text-rose-100/80 font-medium leading-relaxed">
                Visit iijisem.com for the latest issue, archive, author guidelines, editorial board and submission portal.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="inline-flex items-center gap-2 bg-white text-[#800000] px-6 py-4 rounded-full font-black text-[11px] tracking-widest uppercase group-hover:scale-[1.02] transition-transform shadow-xl">
                Open Journal <ExternalLink size={13} />
              </div>
            </div>
          </div>
        </a>
      </section>
    </div>
  );
}
