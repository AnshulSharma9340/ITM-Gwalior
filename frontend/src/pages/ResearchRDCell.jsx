import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { usePublicRDCell } from "../hooks/usePublicResearch";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  Microscope,
  Compass,
  Target,
  Download,
  ExternalLink,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  Lightbulb,
  Briefcase,
  Award,
  Beaker,
  Layers,
} from "lucide-react";

const RESEARCH_SUBNAV = [
  { label: "R&D Cell", to: "/research/rd-cell", active: true },
  { label: "Innovation Ecosystem", to: "/research/innovation-ecosystem" },
  { label: "ITM Journal", to: "/research/journal" },
  { label: "International Conference", to: "/research/conference" },
  { label: "FDP", to: "/research/fdp" },
];

const VISION = "To foster a robust research culture within the institute that drives innovation, intellectual growth, and societal impact through high-quality research and development activities.";
const MISSION = "To support and enhance research activities, protect intellectual properties, provide financial assistance, and communicate research opportunities to faculty and students.";

const KEY_FEATURES = [
  { icon: "💰", title: "Research Promotion Scheme", body: "Financial assistance for faculty to conduct innovative, multi-disciplinary research." },
  { icon: "🏛️", title: "Internal & External Funding", body: "Grants for research projects, publications, and participation in national and international conferences." },
  { icon: "🛡️", title: "IPR Support", body: "Assistance in patent filing and commercialisation of research innovations." },
  { icon: "🤝", title: "Industry-Academia Collaboration", body: "Partnerships with leading industries and academic institutions." },
  { icon: "🎓", title: "Workshops, Conferences & Seminars", body: "Enhancing research skills and knowledge dissemination." },
];

const DEPT_RESEARCH = [
  {
    dept: "Computer Science & Engineering",
    short: "CSE",
    icon: "💻",
    accent: "from-rose-500 to-[#800000]",
    research: "Development of mobile applications and software solutions, supported by industry partnerships.",
    patents: "AI-powered fraud detection · IoT-integrated facial recognition · Blockchain applications",
  },
  {
    dept: "Civil Engineering",
    short: "CE",
    icon: "🏗️",
    accent: "from-amber-500 to-orange-600",
    research: "Research on infrastructure health monitoring, enhancing structural safety.",
    patents: "Sustainable concrete technology · Infrastructure health monitoring · IoT-enabled construction devices",
  },
  {
    dept: "Basic Sciences (Chemistry)",
    short: "Chem",
    icon: "🧪",
    accent: "from-emerald-500 to-teal-700",
    research: "Government-funded work on optoelectronic materials, driving scientific breakthroughs.",
    patents: "International patents in material sciences · Optoelectronics · Environmental sustainability solutions",
  },
  {
    dept: "Electronics & Communication",
    short: "ECE",
    icon: "📡",
    accent: "from-indigo-500 to-violet-700",
    research: "Embedded systems, signal processing and IoT applications across industry.",
    patents: "AI-driven robotics · Smart surveillance · IoT-based automation",
  },
  {
    dept: "Management (MBA)",
    short: "MBA",
    icon: "📈",
    accent: "from-yellow-600 to-amber-800",
    research: "Projects focusing on performance appraisal, wellness initiatives, and market analysis, funded by private organisations.",
    patents: "Financial analytics · Smart irrigation systems · Enterprise solutions",
  },
  {
    dept: "Information Technology",
    short: "IT",
    icon: "🌐",
    accent: "from-sky-500 to-blue-700",
    research: "Cloud, full-stack and enterprise systems research with industry tie-ups.",
    patents: "Enterprise solutions · Web platforms · Data analytics tools",
  },
];

const RESEARCH_AREAS = [
  { name: "AI & Fraud Detection", icon: "🤖" },
  { name: "IoT Facial Recognition", icon: "📡" },
  { name: "Blockchain Applications", icon: "🔗" },
  { name: "Sustainable Concrete", icon: "🏗️" },
  { name: "Infrastructure Health", icon: "📊" },
  { name: "Material Sciences", icon: "🔬" },
  { name: "Optoelectronics", icon: "💡" },
  { name: "Environmental Sustainability", icon: "🌱" },
  { name: "AI-driven Robotics", icon: "🦾" },
  { name: "Smart Surveillance", icon: "📹" },
  { name: "Financial Analytics", icon: "📈" },
  { name: "Smart Irrigation", icon: "💧" },
];

const PUBLICATIONS = [
  { year: "2024-25", count: "60+", url: "http://itmgoi.in/IQAC/docs/DocswithoutDigi/2024-2025.pdf" },
  { year: "2023-24", count: "75+", url: "http://itmgoi.in/IQAC/docs/DocswithoutDigi/2023-24.pdf" },
  { year: "2022-23", count: "80+", url: "http://itmgoi.in/IQAC/docs/DocswithoutDigi/2022-23.pdf" },
  { year: "2021-22", count: "70+", url: "http://itmgoi.in/IQAC/docs/Website_UpdateDec2024/research_publication/2021-22.pdf" },
  { year: "2020-21", count: "65+", url: "http://itmgoi.in/IQAC/docs/DocswithoutDigi/2020-21.pdf" },
  { year: "2019-20", count: "55+", url: "http://itmgoi.in/IQAC/docs/DocswithoutDigi/2019-20.pdf" },
];

const BOOKS = [
  { year: "2023-24", url: "https://www.itmgoi.in/IQAC/docs/DocswithoutDigi/Book_2023-2024.pdf" },
  { year: "2022-23", url: "https://www.itmgoi.in/IQAC/docs/DocswithoutDigi/Book_2022-2023.pdf" },
  { year: "2021-22", url: "https://www.itmgoi.in/IQAC/docs/DocswithoutDigi/Book_2021-2022.pdf" },
  { year: "2019-20", url: "https://www.itmgoi.in/IQAC/docs/DocswithoutDigi/Book_2019-2020.pdf" },
];

const DOCUMENTS = [
  {
    title: "Research Promotion Policy",
    desc: "Institutional policy governing research grants, sabbatical & IPR support.",
    url: "https://www.itmgoi.in/NAAC/docs/policies/Research%20Promotion%20Policy.pdf",
    icon: Shield,
  },
  {
    title: "Research Grants Received",
    desc: "Detailed list of grants received over the past five years.",
    url: "https://www.itmgoi.in/IQAC/docs/DocswithoutDigi/Research_Grants.pdf",
    icon: Briefcase,
  },
  {
    title: "List of IPR 2019-2024",
    desc: "Patents, copyrights and design registrations filed and secured.",
    url: "https://www.itmgoi.in/IQAC/docs/DocswithoutDigi/List_of_IPR_2019-2024.pdf",
    icon: FileText,
  },
  {
    title: "NIRF Patent Details",
    desc: "National Institute Ranking Framework — patent data and reports.",
    url: "https://www.itmgoi.in/nirf_itm_patent_details.php",
    icon: Award,
  },
];

const RESEARCH_GALLERY = [1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32].map(
  (n) => `https://www.itmgoi.in/include/gallery/Research_gallery/${n}.jpg`
);

const BOOK_COVERS = Array.from({ length: 22 }, (_, i) =>
  `https://www.itmgoi.in/include/gallery/Book_Cover/${i + 1}.jpg`
);

const RESEARCH_PAPERS = Array.from({ length: 8 }, (_, i) =>
  `https://www.itmgoi.in/include/gallery/Book_Cover/Research/${i + 1}.jpg`
);

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

export default function ResearchRDCell() {
  const pageKey = useLocation().pathname;
  const [activeArea, setActiveArea] = useState(0);
  const [pubTab, setPubTab] = useState("papers");
  const [showAllGallery, setShowAllGallery] = useState(false);
  const { data: live } = usePublicRDCell();

  const VISION_LIVE = live?.vision || VISION;
  const MISSION_LIVE = live?.mission || MISSION;
  const KEY_FEATURES_LIVE = live?.key_features?.length ? live.key_features : KEY_FEATURES;
  const DEPT_RESEARCH_LIVE = live?.dept_research?.length ? live.dept_research : DEPT_RESEARCH;
  const RESEARCH_AREAS_LIVE = live?.focus_areas?.length ? live.focus_areas : RESEARCH_AREAS;
  const PUBLICATIONS_LIVE = live?.publications?.length
    ? live.publications.map((p) => ({ year: p.year, count: p.count, url: p.url }))
    : PUBLICATIONS_LIVE;
  const BOOKS_LIVE = live?.books?.length
    ? live.books.map((b) => ({ year: b.year, url: b.url }))
    : BOOKS_LIVE;
  const DOCUMENTS_LIVE = live?.policies?.length
    ? live.policies.map((p) => ({ ...p, icon: DOCUMENTS_LIVE.find((d) => d.title === p.title)?.icon || Shield }))
    : DOCUMENTS_LIVE;

  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5"><Home size={11} /> Home</Link>
          <Crumb size={10} className="text-gray-300" />
          <Link to="/research" className="hover:text-[#800000]">Research</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">R&amp;D Cell</span>
        </div>
      </div>

      {/* Research Sub-nav */}
      <div className="bg-gradient-to-r from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-6">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {RESEARCH_SUBNAV.map((item) => (
              <Link key={item.label} to={item.to}>
                <span className={`relative shrink-0 px-4 md:px-5 py-3.5 inline-flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${
                  item.active ? "text-white" : "text-rose-100/70 hover:text-white"
                }`}>
                  {item.label}
                  {item.active && <span className="absolute bottom-0 left-3 right-3 h-1 bg-amber-300 rounded-t-full"></span>}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section data-section="rdcell_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 md:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <Microscope size={12} /> <EditableText pageKey={pageKey} tkey="rdcell.eyebrow" as="span" value="Research & Development Cell">Research &amp; Development Cell</EditableText>
            </span>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-4">
              <EditableText pageKey={pageKey} tkey="rdcell.title.line1" as="span" value="A research culture">A research culture</EditableText> <br />
              <EditableText pageKey={pageKey} tkey="rdcell.title.line2" as="span" value="that ships." className="text-red-200">that ships.</EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
              <EditableText pageKey={pageKey} tkey="rdcell.intro" as="span" multiline
                value="At ITM Gwalior, we're committed to fostering a robust research ecosystem that drives innovation, intellectual growth, and societal impact.">
                At ITM Gwalior, we&apos;re committed to fostering a robust research ecosystem that drives
                innovation, intellectual growth, and societal impact.
              </EditableText>
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {[
              { v: 405, l: "Papers (2019-25)", suffix: "+" },
              { v: 4, l: "Books / Chapters" },
              { v: 11, l: "Focus Areas" },
              { v: 6, l: "Research Departments" },
            ].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-3 sm:p-5">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.04em] leading-none"><BigNumber value={s.v} suffix={s.suffix || ""} /></div>
                <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-2">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision + Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm p-4 sm:p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#800000] to-amber-500"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-white flex items-center justify-center mb-5"><Compass size={22} /></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000] mb-2">R&amp;D Vision</div>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">&ldquo;{VISION_LIVE}&rdquo;</p>
          </div>
          <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm p-4 sm:p-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-[#800000]"></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 text-white flex items-center justify-center mb-5"><Target size={22} /></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700 dark:text-amber-400 mb-2">R&amp;D Mission</div>
            <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">&ldquo;{MISSION_LIVE}&rdquo;</p>
          </div>
        </div>
      </section>

      {/* What the R&D Cell Offers */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">What R&amp;D Cell Offers</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Five pillars of institutional support.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {KEY_FEATURES_LIVE.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-white dark:from-gray-900 to-rose-50/40 dark:to-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-5 hover:shadow-xl transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight mb-2 leading-snug">{f.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive 12 Research Areas */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Focus Areas</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Twelve research domains across departments.
          </h2>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={RESEARCH_AREAS_LIVE[activeArea].name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}
            className="relative overflow-hidden rounded-3xl mb-6 shadow-2xl bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white">
            <div className="absolute -top-20 -right-20 text-[16rem] opacity-10 pointer-events-none leading-none select-none">{RESEARCH_AREAS_LIVE[activeArea].icon}</div>
            <div className="relative p-8 md:p-12 grid lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-9">
                <div className="text-7xl mb-4">{RESEARCH_AREAS_LIVE[activeArea].icon}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-300 mb-2">Focus Area · {activeArea + 1} of {RESEARCH_AREAS_LIVE.length}</div>
                <h3 className="text-2xl md:text-4xl font-black tracking-[-0.03em] leading-tight">{RESEARCH_AREAS_LIVE[activeArea].name}</h3>
              </div>
              <div className="lg:col-span-3 flex items-center gap-2">
                <button onClick={() => setActiveArea((activeArea - 1 + RESEARCH_AREAS_LIVE.length) % RESEARCH_AREAS_LIVE.length)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/30 hover:bg-white/20 flex items-center justify-center"><ChevronLeft size={18} /></button>
                <button onClick={() => setActiveArea((activeArea + 1) % RESEARCH_AREAS_LIVE.length)} className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/30 hover:bg-white/20 flex items-center justify-center"><ChevronRight size={18} /></button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {RESEARCH_AREAS_LIVE.map((a, i) => (
            <button key={a.name} onClick={() => setActiveArea(i)}
              className={`group relative overflow-hidden text-left rounded-2xl border-2 transition-all p-4 ${i === activeArea ? "border-[#800000] shadow-xl bg-white dark:bg-gray-900" : "border-rose-50 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-rose-200 dark:hover:border-gray-600"}`}>
              <div className="text-3xl mb-2">{a.icon}</div>
              <h4 className="font-black text-xs tracking-tight text-[#1a0606] dark:text-white leading-snug line-clamp-2">{a.name}</h4>
            </button>
          ))}
        </div>
      </section>

      {/* Department-wise research */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6 sm:mb-10 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Department Research</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Research by department · what we publish &amp; patent.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEPT_RESEARCH_LIVE.map((d, i) => (
              <motion.div key={d.short} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl shadow-sm hover:shadow-xl transition-shadow">
                <div className={`h-1.5 bg-gradient-to-r ${d.accent}`}></div>
                <div className="p-3 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-4xl">{d.icon}</div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-gray-400">{d.short}</div>
                      <h3 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug">{d.dept}</h3>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-[#800000] mb-1">Research focus</div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{d.research}</p>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-amber-700 dark:text-amber-400 mb-1">Patents / IPR areas</div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{d.patents}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Publications archive */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Publications Archive</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Six years of published research.
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium">
              Download year-wise PDFs of all research papers and books published by ITM faculty.
            </p>
          </div>
          <div className="inline-flex bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-800 rounded-full p-1.5 shadow-sm">
            {[
              { id: "papers", label: "Research Papers" },
              { id: "books", label: "Books & Chapters" },
            ].map((t) => (
              <button key={t.id} onClick={() => setPubTab(t.id)}
                className={`relative px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-colors ${pubTab === t.id ? "text-white" : "text-gray-500 hover:text-gray-700"}`}>
                {pubTab === t.id && <motion.span layoutId="pub-tab" className="absolute inset-0 bg-[#800000] rounded-full"></motion.span>}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {pubTab === "papers" ? (
            <motion.div key="papers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PUBLICATIONS_LIVE.map((p, i) => (
                <a key={p.year} href={p.url} target="_blank" rel="noreferrer" className={`group relative overflow-hidden rounded-3xl p-3 sm:p-6 hover:shadow-2xl transition-shadow ${i === 0 ? "bg-gradient-to-br from-[#3e0202] to-[#800000] text-white" : "bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <FileText size={22} className={i === 0 ? "text-amber-300" : "text-[#800000]"} />
                    {i === 0 && <span className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-300 text-[#1a0606] rounded">Latest</span>}
                  </div>
                  <div className={`text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.04em] mb-1 ${i === 0 ? "text-amber-200" : "text-[#800000]"}`}>{p.count}</div>
                  <div className={`text-[10px] uppercase tracking-widest font-black ${i === 0 ? "text-white/80" : "text-gray-500"}`}>{p.year}</div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black group-hover:gap-3 transition-all">
                    <Download size={11} /> Download PDF
                  </div>
                </a>
              ))}
            </motion.div>
          ) : (
            <motion.div key="books" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BOOKS_LIVE.map((b, i) => (
                <a key={b.year} href={b.url} target="_blank" rel="noreferrer" className={`group relative overflow-hidden rounded-3xl p-6 hover:shadow-2xl transition-shadow ${i === 0 ? "bg-gradient-to-br from-[#3e0202] to-[#800000] text-white" : "bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <Layers size={22} className={i === 0 ? "text-amber-300" : "text-[#800000]"} />
                    {i === 0 && <span className="text-[9px] uppercase tracking-widest font-black px-2 py-0.5 bg-amber-300 text-[#1a0606] rounded">Latest</span>}
                  </div>
                  <div className={`text-2xl font-black tracking-tight mb-1 ${i === 0 ? "text-amber-200" : "text-[#800000]"}`}>{b.year}</div>
                  <div className={`text-[10px] uppercase tracking-widest font-black ${i === 0 ? "text-white/80" : "text-gray-500"}`}>Books &amp; Chapters</div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black group-hover:gap-3 transition-all">
                    <Download size={11} /> Download PDF
                  </div>
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Research Photo Gallery */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Research Gallery</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Research in action.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {(showAllGallery ? RESEARCH_GALLERY : RESEARCH_GALLERY.slice(0, 8)).map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl bg-rose-50 dark:bg-gray-800">
                <img src={src} alt={`Research activity ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
          {!showAllGallery && (
            <div className="text-center mb-12">
              <button onClick={() => setShowAllGallery(true)} className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-white dark:bg-gray-900 border border-rose-100 dark:border-gray-800 rounded-full text-[11px] font-black uppercase tracking-widest text-[#800000] hover:shadow-md transition-shadow">
                Show all {RESEARCH_GALLERY.length} photos
              </button>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-4">Book Covers · {BOOK_COVERS.length} publications</div>
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {BOOK_COVERS.map((src, i) => (
                  <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg">
                    <img src={src} alt={`Book cover ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-4">Research Paper Front Pages · {RESEARCH_PAPERS.length} samples</div>
              <div className="grid grid-cols-4 gap-2">
                {RESEARCH_PAPERS.map((src, i) => (
                  <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg">
                    <img src={src} alt={`Research paper ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents downloads */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Official Documents</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Policies · Grants · IPR · NIRF
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {DOCUMENTS_LIVE.map((d, i) => (
              <motion.a key={d.title} href={d.url} target="_blank" rel="noreferrer" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}
                className="group relative overflow-hidden bg-gradient-to-br from-white dark:from-gray-900 to-rose-50/40 dark:to-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6 hover:shadow-xl transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-gray-800 text-[#800000] flex items-center justify-center mb-4"><d.icon size={18} /></div>
                <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight mb-2 leading-snug">{d.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-4">{d.desc}</p>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#800000] group-hover:gap-2.5 transition-all">
                  Open <ArrowUpRight size={12} />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Electoral Literacy Club */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 dark:from-gray-900 to-white dark:to-gray-900 border border-rose-100 dark:border-gray-800 rounded-3xl p-8 md:p-10">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-[#800000]/5 pointer-events-none"></div>
          <div className="relative max-w-3xl">
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] px-3 py-1.5 bg-rose-100 dark:bg-gray-800 text-[#800000] rounded-full mb-4">
              🗳️ Electoral Literacy Club · ELC
            </span>
            <h3 className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white mb-3 leading-snug">
              Promoting democratic participation.
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              A student-driven initiative at ITM Gwalior, the Electoral Literacy Club promotes voter awareness and democratic participation under the guidance of the Election Commission of India. ELC actively engages students in understanding electoral processes and their civic responsibilities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white p-4 sm:p-8 md:p-12 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-amber-300 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <Lightbulb size={12} /> R&amp;D Cell
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-3">Need research funding or IPR support?</h3>
            <p className="text-rose-100/80 text-sm font-medium max-w-md">
              The R&amp;D Cell handles internal funding, external grant facilitation, patent filing and industry collaboration.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link to="/research/innovation-ecosystem" className="bg-amber-300 text-[#1a0606] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform">
              Visit Innovation Ecosystem
            </Link>
            <Link to="/research/journal" className="bg-black/30 backdrop-blur text-white border border-white/30 text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-black/50 transition-colors">
              Submit to our Journal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
