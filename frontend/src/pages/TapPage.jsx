import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import axios from "axios";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  Quote,
  ChevronLeft,
  ChevronRight,
  Target,
  Compass,
  ArrowRight,
  ArrowUpRight,
  Phone,
  Mail,
  Building2,
  Briefcase,
  GraduationCap,
  Users,
  Award,
  Calendar,
  Star,
  CheckCircle2,
  TrendingUp,
  FileDown,
  ClipboardCheck,
  Presentation,
} from "lucide-react";
import PlacementData from "../components/PlacementData";

// ─── Real content scraped from itmgoi.in ──────────────────────────
const TAP_VISION = "To bridge the gap between students' skill, knowledge and the industry's requirement and expectation by building employability through various workshops, seminars and campus recruitment training so that the student can grab the best opportunities and will grow vigorously in their career.";
const TAP_MISSION = "The Training Augmentation and Placement team of ITM Gwalior is dedicated towards achieving 100% placements by collaborating with HR teams of different corporates to ensure the smooth functioning of the Campus-Recruitment process.";

const TAP_TEAM = [
  {
    name: "Mr. Arpit Singh Chauhan",
    role: "Dean / Director TAP CELL (I/C)",
    email: "arpit.chauhan@itmuniversity.ac.in",
    phone: "+91-9691973919",
    initials: "AC",
    accent: "from-rose-500 to-[#800000]",
    photo: "https://www.itmgoi.in/assets2/images/Arpit_Singh.jpg",
  },
  {
    name: "Mrs. Shikha Sharma",
    role: "Assistant Director Placement",
    email: "shikhasharma@itmuniversity.ac.in",
    phone: "+91-9229333335",
    initials: "SS",
    accent: "from-amber-500 to-orange-600",
    photo: "https://www.itmgoi.in/assets2/images/Shikha_Sharma.jpg",
  },
];

const TAP_SERVICES = [
  {
    icon: ClipboardCheck,
    title: "Personal Interview Training",
    desc: "One-on-one sessions before every placement / internship drive — covering aptitude, mock interviews and HR-fit grooming.",
    bgClass: "bg-rose-50 dark:bg-rose-950/20",
    textClass: "text-[#800000] dark:text-rose-400",
    accent: "from-rose-500 to-[#800000]",
  },
  {
    icon: Presentation,
    title: "Industrial Expert Talks",
    desc: "Renowned professionals from industry share overviews, tips and case studies — online and offline sessions throughout the year.",
    bgClass: "bg-amber-50 dark:bg-amber-950/20",
    textClass: "text-amber-700 dark:text-amber-400",
    accent: "from-amber-500 to-orange-600",
  },
  {
    icon: Briefcase,
    title: "Mandatory 45-day Internship",
    desc: "Every student completes a 45-day summer internship — industry exposure, practical learning and an offer pipeline.",
    bgClass: "bg-emerald-50 dark:bg-emerald-950/20",
    textClass: "text-emerald-700 dark:text-emerald-400",
    accent: "from-emerald-500 to-teal-700",
  },
  {
    icon: Target,
    title: "Campus Recruitment Drives",
    desc: "150+ recruiters on campus year-round including TCS, Infosys, Wipro, Capgemini, ICICI, IBM, Cognizant, FedEx and more.",
    bgClass: "bg-indigo-50 dark:bg-indigo-950/20",
    textClass: "text-indigo-600 dark:text-indigo-400",
    accent: "from-indigo-500 to-violet-700",
  },
];

const TAP_MOUS = [
  {
    name: "EduSkills Foundation",
    logo: "🎓",
    logo_img: "https://www.itmgoi.in/assets2/images/LOGO_EduSkills.png",
    desc: "Digital skills expansion in networking, cyber security, cloud computing, automation and RPA. ITM ranked #35 nationally in EduSkills Virtual Internship Rankings 2024.",
    tags: ["Networking", "Cyber Security", "Cloud", "RPA"],
  },
  {
    name: "AWS Academy",
    logo: "☁️",
    logo_img: "https://www.itmgoi.in/assets2/images/aws.jpg",
    desc: "Authorised AWS Academy — cloud computing, machine learning and data analytics training with AWS-recognised certifications.",
    tags: ["AWS Cloud", "ML", "Data Analytics"],
  },
  {
    name: "Microsoft Learn",
    logo: "🪟",
    logo_img: "https://www.itmgoi.in/assets2/images/ms.jpg",
    desc: "Center of Excellence (May 2024 – April 2025). Programmes in AI, cyber security and green skills with Microsoft certifications.",
    tags: ["AI", "Cyber Security", "Green Skills"],
  },
  {
    name: "Bajaj FinServ",
    logo: "💼",
    logo_img: "https://www.itmgoi.in/assets2/images/mou.jpg",
    desc: "Certificate Programme in Banking, Finance and Insurance (CPBFI) — industry-driven curriculum and guaranteed interview pipeline.",
    tags: ["BFSI", "Certified"],
  },
];

const MOU_DOCS = [
  { label: "MoU 2023–2024", url: "https://www.itmgoi.in/IQAC/docs/Website_UpdateDec2024/MoU_2023-2024.pdf" },
  { label: "MoU 2022–2023", url: "https://www.itmgoi.in/IQAC/docs/Website_UpdateDec2024/MoU_2022-2023.pdf" },
  { label: "MoU 2021–2022", url: "https://www.itmgoi.in/IQAC/docs/Website_UpdateDec2024/MoU_2021-2022.pdf" },
  { label: "MoU 2020–2021", url: "https://www.itmgoi.in/IQAC/docs/Website_UpdateDec2024/MoU_2020-2021.pdf" },
  { label: "MoU 2019–2020", url: "https://www.itmgoi.in/IQAC/docs/Website_UpdateDec2024/MoU_2019-2020.pdf" },
];

const TAP_SHOWCASE = [
  { src: "https://www.itmgoi.in/assets2/images/ITM_Gwalior_Major_Recruiter.jpg", alt: "Major Recruiters at ITM Gwalior" },
  { src: "https://www.itmgoi.in/assets2/images/itm_gwalior_placement.jpg", alt: "ITM Gwalior Placement Drive" },
];

const INDUSTRY_SPEAK = [
  { name: "Aditya Mahajan", role: "Recruiter Campus Hiring, TCS", text: "It was a wonderful and great experience for conducting interviews at ITM. Students were well prepared. College Management has invested a lot in grooming them. Good performance by students. Good professionalism.", initials: "AM", accent: "from-rose-500 to-[#800000]" },
  { name: "Lakshmi", role: "Regional Head, Wipro", text: "It was a good batch that we interviewed met most of our requirement. Technical knowledge of students was good. Looking forward to conduct more drives in future.", initials: "L", accent: "from-amber-500 to-orange-600" },
  { name: "Ronak Choudhary", role: "Regional Head, Cognizant", text: "The spirit shown by students was very delightful and encouraging for us & for our company too. Did bulk hiring even on the virtual mode. Students have good technical knowledge.", initials: "RC", accent: "from-emerald-500 to-teal-700" },
  { name: "Piuli Ghosh", role: "Campus Lead, ICICI", text: "We had a good experience! We expected more candidates for interview, out of 30 to 40 students almost 50% got placed. Decent quality of students.", initials: "PG", accent: "from-indigo-500 to-violet-700" },
  { name: "Deepti Thakur", role: "Campus Team, Xiaomi", text: "It was a good experience, glad to provide this opportunity to the students of ITM. Students should keep working on aptitude.", initials: "DT", accent: "from-sky-500 to-blue-700" },
  { name: "Sandeep Mishra", role: "HR, VISA Steel", text: "It was an amazing experience and the students were really enthusiastic. Every year we get an upgraded batch. Will love to visit again.", initials: "SM", accent: "from-pink-500 to-rose-700" },
  { name: "Kajal Soni", role: "HR Recruiter, Thermax Limited", text: "During the pandemic time, it was unexpected to conduct such a wonderful drive on a Virtual Mode. Students have good technical knowledge. Great experience!", initials: "KS", accent: "from-yellow-600 to-amber-800" },
  { name: "Akhil James", role: "HR Specialist, FedEx", text: "Had a great experience visiting ITM. Courtesy campus members really appreciate the efforts and support provided. Well-groomed and prepared students.", initials: "AJ", accent: "from-violet-500 to-indigo-700" },
  { name: "Amrita Paul", role: "DGM, IBM India", text: "Good Campus. Got lot of support from the staff, well organised. It was a pleasure being here.", initials: "AP", accent: "from-cyan-500 to-blue-700" },
  { name: "Ms. Shazia Siddiqui", role: "HR Manager, Infosys Technologies", text: "Extremely impressive infrastructure. A good team of officials with a good vision for the institute and the students. The students will definitely be groomed into good professionals.", initials: "SS", accent: "from-lime-500 to-green-700" },
  { name: "Achu Mani", role: "Senior Analyst, Mphasis", text: "It was a good batch that we interviewed. Good luck to each of them.", initials: "AM", accent: "from-teal-500 to-cyan-700" },
  { name: "Varun Jain", role: "Senior Project Manager, Infosys Limited", text: "Overall good performance by students. Impressive communication skills.", initials: "VJ", accent: "from-blue-500 to-sky-700" },
];

const TOP_RECRUITERS = ["TCS", "Wipro", "Cognizant", "ICICI", "Xiaomi", "VISA Steel", "Thermax", "FedEx", "Mphasis", "IBM India", "Infosys Technologies", "Infosys Limited"];

// ─── animated counter ─────────────────────────────────
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

  return (
    <span ref={ref}>
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

export default function TapPage() {
  const pageKey = useLocation().pathname;
  const [activeQuote, setActiveQuote] = useState(0);
  const [events, setEvents] = useState({ upcoming: [], past: [] });
  const [activeEvent, setActiveEvent] = useState(0);
  const [tap, setTap] = useState(null);

  // Live data from the CMS public payload — falls back to bundled constants if unavailable.
  useEffect(() => {
    axios.get("/api/public/tap").then((r) => setTap(r.data)).catch(() => {});
  }, []);

  const TAP_VISION_LIVE = tap?.vision ?? TAP_VISION;
  const TAP_MISSION_LIVE = tap?.mission ?? TAP_MISSION;
  const TAP_TEAM_LIVE = tap?.team?.length ? tap.team : TAP_TEAM;
  const TAP_SERVICES_LIVE = TAP_SERVICES; // icons are React components; keep bundled
  const TAP_MOUS_LIVE = tap?.mous?.length ? tap.mous : TAP_MOUS;
  const MOU_DOCS_LIVE = tap?.mou_docs?.length ? tap.mou_docs : MOU_DOCS;
  const INDUSTRY_SPEAK_LIVE = tap?.testimonials?.length
    ? tap.testimonials.map((t) => ({ ...t, text: t.text || t.quote }))
    : INDUSTRY_SPEAK;
  const TOP_RECRUITERS_LIVE = tap?.top_recruiters?.length ? tap.top_recruiters : TOP_RECRUITERS;

  const speak = INDUSTRY_SPEAK_LIVE[activeQuote] ?? INDUSTRY_SPEAK_LIVE[0];
  const nextQuote = () => setActiveQuote((i) => (i + 1) % INDUSTRY_SPEAK_LIVE.length);
  const prevQuote = () => setActiveQuote((i) => (i - 1 + INDUSTRY_SPEAK_LIVE.length) % INDUSTRY_SPEAK_LIVE.length);

  // Auto-rotate quotes
  useEffect(() => {
    const t = setInterval(nextQuote, 6000);
    return () => clearInterval(t);
  }, [INDUSTRY_SPEAK_LIVE.length]);

  // Fetch events from FastAPI backend (legacy endpoint — falls back silently if missing)
  useEffect(() => {
    axios.get("/api/events/all")
      .then((r) => setEvents(r.data))
      .catch((e) => console.error("Events fetch failed:", e));
  }, []);

  // Recruiter logos marquee
  const loopedRecruiters = [...Array(39).keys(), ...Array(39).keys()];

  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      {/* ─────────── BREADCRUMB ─────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5"><Home size={11} /> Home</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">Training &amp; Placement</span>
        </div>
      </div>

      {/* ─────────── HERO ─────────── */}
      <section data-section="tap_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-20 -left-10 w-96 h-96 rounded-full border border-white/40"></div>
          <div className="absolute top-1/3 left-1/3 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 md:py-20 grid lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <Sparkles size={12} /> ITM Gwalior · TAP Cell
            </span>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-4">
              <EditableText pageKey={pageKey} tkey="tap.title.line1" as="span" value="Training &">Training &amp;</EditableText><br />
              <EditableText pageKey={pageKey} tkey="tap.title.line2" as="span" value="Placement Cell." className="text-red-200">Placement Cell.</EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium mb-8">
              <EditableText pageKey={pageKey} tkey="tap.intro" as="span" multiline
                value="State-of-the-art TAP cell headed by experienced industry professionals. We groom every student — communication, aptitude, technology, attitude — and connect them to 150+ recruiting partners.">
                State-of-the-art TAP cell headed by experienced industry professionals.
                We groom every student — communication, aptitude, technology, attitude —
                and connect them to 150+ recruiting partners.
              </EditableText>
            </p>

            <div className="flex flex-wrap gap-3">
              <a href="#contact" className="inline-flex items-center gap-2 bg-white text-[#800000] px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform shadow-xl">
                Contact TAP Cell <ArrowRight size={14} />
              </a>
              <a href="#partners" className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-white/20">
                View Recruiters
              </a>
            </div>
          </div>

          {/* Animated stats grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3">
            {[
              { v: 150, s: "+", l: "Recruiting Partners" },
              { v: 80, s: "%+", l: "Placement Rate" },
              { v: 45, s: "d", l: "Internship Programme" },
              { v: 100, s: "%", l: "Placement Goal" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 sm:p-5 hover:bg-white/20 transition-colors"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.04em] leading-none">
                  <BigNumber value={s.v} suffix={s.s} />
                </div>
                <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-2">{s.l}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── VISION + MISSION + TEAM ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6">

          {/* LEFT: Vision/Mission */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm p-4 sm:p-7"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#800000] to-amber-500"></div>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-white flex items-center justify-center mb-5">
                <Compass size={20} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000] mb-2">Our Vision</div>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                &ldquo;{TAP_VISION_LIVE}&rdquo;
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm p-4 sm:p-7"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-[#800000]"></div>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 text-white flex items-center justify-center mb-5">
                <Target size={20} />
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700 mb-2">Our Mission</div>
              <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">
                &ldquo;{TAP_MISSION_LIVE}&rdquo;
              </p>
            </motion.div>

            {/* Big numbers strip */}
            <div className="sm:col-span-2 grid grid-cols-3 gap-3">
              {[
                { v: "150+", l: "Recruiters", c: "bg-rose-50 text-[#800000]" },
                { v: "11+", l: "Top Brands", c: "bg-amber-50 text-amber-700" },
                { v: "10+", l: "Industry MOUs", c: "bg-emerald-50 text-emerald-700" },
              ].map((b) => (
                <div key={b.l} className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-2xl p-4 text-center">
                  <div className={`inline-block px-3 py-1 rounded-full text-2xl md:text-3xl font-black tracking-tighter ${b.c}`}>{b.v}</div>
                  <div className="text-[9px] uppercase tracking-widest font-black text-gray-500 mt-2">{b.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: TAP Team */}
          <div id="contact" className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">TAP Team</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white mb-6">
              The people behind your offer letter.
            </h2>
            <div className="space-y-3">
              {TAP_TEAM_LIVE.map((m, i) => (
                <motion.div
                  key={m.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm hover:shadow-xl transition-shadow p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className={`shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${m.accent} text-white flex items-center justify-center font-black text-lg tracking-tight shadow-lg overflow-hidden`}>
                      {m.photo
                        ? <img src={m.photo} alt={m.name} loading="lazy" decoding="async" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                        : m.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight">{m.name}</h4>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#800000] mt-0.5">{m.role}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-rose-50 dark:border-gray-800 flex flex-wrap gap-3 text-xs">
                    <a href={`tel:${m.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-[#800000] font-bold">
                      <Phone size={12} className="text-[#800000]" /> {m.phone}
                    </a>
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-[#800000] font-bold break-all">
                      <Mail size={12} className="text-[#800000]" /> {m.email}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── WHAT WE DO ─────────── */}
      <section className="bg-white dark:bg-gray-900/30 py-8 sm:py-16 md:py-24 border-y border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">What TAP Does</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Four pillars of every student&apos;s success.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TAP_SERVICES.map((s, i) => {
              const IconComponent = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-rose-50/40 dark:from-gray-900 dark:to-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-shadow p-3 sm:p-6"
                >
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${s.accent} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`}></div>
                  <div className="relative">
                    <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-2xl ${s.bgClass} ${s.textClass} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent size={22} />
                    </div>
                    <h3 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight mb-3 leading-snug">
                      {s.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{s.desc}</p>
                    <div className={`mt-4 h-px w-8 bg-gradient-to-r ${s.accent} group-hover:w-full transition-all duration-700`}></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── INDUSTRY MOUS ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Industry MoUs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Backed by the world&apos;s biggest brands.
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md font-medium leading-relaxed">
            Formal collaborations with Microsoft, AWS, EduSkills, Bajaj FinServ and 8+ specialised training partners.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {TAP_MOUS_LIVE.map((mou, i) => (
            <motion.div
              key={mou.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-shadow p-4 sm:p-7"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-full opacity-50"></div>
              <div className="relative flex items-start gap-5">
                <div className="shrink-0 w-16 h-16 rounded-2xl bg-white border border-gray-100 dark:border-gray-700 flex items-center justify-center overflow-hidden p-1">
                  {mou.logo_img
                    ? <img src={mou.logo_img} alt={mou.name} loading="lazy" decoding="async" className="w-full h-full object-contain" onError={(e) => { e.target.replaceWith(Object.assign(document.createElement("span"), { textContent: mou.logo, className: "text-4xl" })); }} />
                    : <span className="text-4xl">{mou.logo}</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-lg tracking-tight text-[#1a0606] dark:text-white">{mou.name}</h3>
                    <span className="text-[9px] uppercase tracking-widest font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">MoU</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-3">{mou.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mou.tags.map((t) => (
                      <span key={t} className="text-[9px] uppercase tracking-widest font-black px-2 py-1 bg-rose-50 dark:bg-gray-800 text-[#800000] rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* MoU documents + showcase */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-rose-50/40 dark:from-gray-900 dark:to-gray-900 rounded-3xl p-6 border border-rose-50 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <FileDown size={14} className="text-[#800000]" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#800000]">
                MoU Documents
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MOU_DOCS_LIVE.map((d) => (
                <a key={d.label} href={d.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black tracking-tight px-3 py-2 bg-white dark:bg-gray-800 text-[#800000] rounded-xl border border-rose-100 dark:border-gray-700 hover:bg-[#800000] hover:text-white hover:border-[#800000] transition-colors">
                  <FileDown size={11} /> {d.label}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TAP_SHOWCASE.map((img) => (
              <div key={img.alt} className="rounded-2xl overflow-hidden bg-rose-50 dark:bg-gray-800 aspect-video">
                <img src={img.src} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── RECRUITER LOGO SHOWCASE ─────────── */}
      <section id="partners" className="bg-[#1a0606] text-white py-8 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-300/30 mb-3">
              <Briefcase size={12} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">150+ Recruiters</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-3">
              Where our students{" "}
              <span className="bg-gradient-to-r from-amber-300 to-rose-200 bg-clip-text text-transparent">
                start their careers.
              </span>
            </h2>
            <p className="text-sm text-rose-100/70 font-medium">
              From global tech giants to leading Indian financial institutions and FMCG brands.
            </p>
          </div>

          {/* Top brand chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {TOP_RECRUITERS_LIVE.map((r) => (
              <span key={r} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Logo marquee */}
        <div className="space-y-3 relative">
          <div className="absolute inset-y-0 left-0 w-20 md:w-32 bg-gradient-to-r from-[#1a0606] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-20 md:w-32 bg-gradient-to-l from-[#1a0606] to-transparent z-10 pointer-events-none"></div>

          <div className="flex overflow-hidden group">
            <div className="flex gap-3 animate-[tap-marquee-l_50s_linear_infinite] group-hover:[animation-play-state:paused]">
              {loopedRecruiters.map((idx, k) => (
                <div key={`l${k}`} className="shrink-0 w-32 h-20 md:w-40 md:h-24 bg-white rounded-2xl flex items-center justify-center p-3 hover:scale-105 transition-transform">
                  <img
                    src={`/images/company_logos/Engineering_Computer_Applications/logo_${idx}.png`}
                    alt={`Recruiter ${idx + 1}`}
                    loading="lazy"
                    onError={(e) => (e.target.style.display = "none")}
                    className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex overflow-hidden group">
            <div className="flex gap-3 animate-[tap-marquee-r_55s_linear_infinite] group-hover:[animation-play-state:paused]">
              {[...Array(37).keys(), ...Array(37).keys()].map((idx, k) => (
                <div key={`r${k}`} className="shrink-0 w-32 h-20 md:w-40 md:h-24 bg-white rounded-2xl flex items-center justify-center p-3 hover:scale-105 transition-transform">
                  <img
                    src={`/images/company_logos/Management/logo_${idx}.png`}
                    alt={`Recruiter ${idx + 1}`}
                    loading="lazy"
                    onError={(e) => (e.target.style.display = "none")}
                    className="w-full h-full object-contain grayscale hover:grayscale-0 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes tap-marquee-l { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          @keyframes tap-marquee-r { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        `}</style>
      </section>

      {/* ─────────── INDUSTRY SPEAK CAROUSEL ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Industry Speak</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              What recruiters say about ITM.
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={prevQuote} className="w-12 h-12 rounded-full border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-[#800000] hover:text-white hover:border-[#800000] text-[#800000] flex items-center justify-center transition-all">
              <ChevronLeft size={18} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
              {String(activeQuote + 1).padStart(2, "0")} <span className="text-gray-300">/</span> {String(INDUSTRY_SPEAK_LIVE.length).padStart(2, "0")}
            </span>
            <button onClick={nextQuote} className="w-12 h-12 rounded-full border border-rose-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-[#800000] hover:text-white hover:border-[#800000] text-[#800000] flex items-center justify-center transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-3 sm:gap-6">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={speak.name}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl p-4 sm:p-8 md:p-12"
              >
                <div className={`absolute -top-20 -right-20 w-72 h-72 rounded-full bg-gradient-to-br ${speak.accent} opacity-10 blur-2xl pointer-events-none`}></div>
                <Quote size={80} className="absolute top-6 right-6 text-rose-100 -scale-x-100" />

                <div className="relative">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" className="text-amber-500" />)}
                  </div>
                  <p className="text-lg md:text-2xl text-gray-800 dark:text-gray-100 leading-relaxed font-medium italic mb-8">
                    &ldquo;{speak.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4 pt-6 border-t border-rose-50 dark:border-gray-800">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${speak.accent} text-white flex items-center justify-center font-black tracking-tight shadow-lg`}>
                      {speak.initials}
                    </div>
                    <div>
                      <h4 className="font-black text-base tracking-tight text-[#1a0606] dark:text-white">{speak.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#800000] mt-0.5">{speak.role}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {INDUSTRY_SPEAK_LIVE.map((t, i) => (
              <button
                key={t.name + i}
                onClick={() => setActiveQuote(i)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  i === activeQuote ? "bg-white dark:bg-gray-900 border-[#800000] shadow-lg" : "bg-white/50 dark:bg-gray-900/50 border-transparent hover:border-rose-200"
                }`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${t.accent} text-white flex items-center justify-center text-xs font-black`}>
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black tracking-tight text-[#1a0606] dark:text-white truncate">{t.name}</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-gray-500 truncate">{t.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── UPCOMING TAP EVENTS — always visible ─────────── */}
      <section id="events" className="bg-gradient-to-b from-[#fbf7f2] to-white dark:bg-gray-900/30 py-8 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center justify-center gap-3 mb-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Live · TAP Events</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Upcoming campus drives <br />
              <span className="bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent">
                and sessions.
              </span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium leading-relaxed">
              Recruiter visits, interview drills, expert talks and internship windows — published live by the TAP team.
            </p>
          </div>

          {/* ─── Featured upcoming event (large hero card with rotating slides) ─── */}
          {events.upcoming.length > 0 ? (
            <>
              <div className="relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-2xl mb-6">
                <AnimatePresence mode="wait">
                  {events.upcoming.map((e, i) => i === activeEvent && (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.4 }}
                      className="grid md:grid-cols-2 gap-0"
                    >
                      <div className="relative aspect-video md:aspect-auto md:min-h-[400px] overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src={`http://localhost:8000${e.image_url}`} alt={e.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        <div className="absolute top-4 left-4 inline-flex items-center gap-2 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                          Upcoming
                        </div>
                      </div>
                      <div className="p-8 md:p-10 flex flex-col justify-center">
                        <div className="text-6xl mb-4">{e.icon || "📅"}</div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2">
                          <Calendar size={11} className="inline mr-1.5" />
                          {new Date(e.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-tight mb-4">
                          {e.title}
                        </h3>
                        <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium mb-6">
                          {e.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveEvent((activeEvent - 1 + events.upcoming.length) % events.upcoming.length)}
                            className="w-11 h-11 rounded-full border border-rose-200 hover:bg-[#800000] hover:text-white hover:border-[#800000] text-[#800000] flex items-center justify-center transition-all"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">
                            {String(activeEvent + 1).padStart(2, "0")} / {String(events.upcoming.length).padStart(2, "0")}
                          </span>
                          <button
                            onClick={() => setActiveEvent((activeEvent + 1) % events.upcoming.length)}
                            className="w-11 h-11 rounded-full border border-rose-200 hover:bg-[#800000] hover:text-white hover:border-[#800000] text-[#800000] flex items-center justify-center transition-all"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Strip of upcoming thumbnails */}
              {events.upcoming.length > 1 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-10">
                  {events.upcoming.map((e, i) => (
                    <button
                      key={e.id}
                      onClick={() => setActiveEvent(i)}
                      className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
                        i === activeEvent ? "border-[#800000] shadow-xl" : "border-rose-50 hover:border-rose-200"
                      }`}
                    >
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800">
                        <img src={`http://localhost:8000${e.image_url}`} alt={e.title} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <div className="text-lg">{e.icon || "📅"}</div>
                        <div className="text-[9px] uppercase tracking-widest font-black truncate">{e.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            // ─── Empty state ───
            <div className="bg-gradient-to-br from-rose-50/60 dark:from-gray-800/60 to-amber-50/60 dark:to-gray-800/60 border-2 border-dashed border-rose-200 dark:border-gray-700 rounded-3xl p-12 text-center mb-10">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="font-black text-xl text-[#1a0606] dark:text-white mb-2">No upcoming events at the moment</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto mb-5">
                The TAP team is preparing the next set of campus drives. Check back soon — new events are added regularly.
              </p>
              <a href="tel:+919691973919" className="inline-flex items-center gap-2 bg-[#800000] text-white px-5 py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-red-900 transition-colors">
                <Phone size={12} /> Contact TAP Cell
              </a>
            </div>
          )}

          {/* ─── Past drives ─── */}
          {events.past.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={14} className="text-gray-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  Past Drives · {events.past.length}
                </span>
              </div>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                {events.past.map((e) => (
                  <div key={e.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-rose-50 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <img src={`http://localhost:8000${e.image_url}`} alt={e.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" loading="lazy" />
                    </div>
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base">{e.icon || "📅"}</span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                          {new Date(e.event_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-[#1a0606] dark:text-white tracking-tight leading-snug line-clamp-2">{e.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─────────── PLACEMENT RECORDS ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Placement Records</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Real students. Real offers.
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md font-medium leading-relaxed">
            Browse the verified placement letters from our most recent batches.
          </p>
        </div>
        <PlacementData />
      </section>

      {/* ─────────── CTA STRIP ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 sm:pb-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white p-4 sm:p-8 md:p-12 grid md:grid-cols-2 gap-4 sm:gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <Award size={12} /> Hire from ITM
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-3">
              Recruiter? Let&apos;s talk.
            </h3>
            <p className="text-red-100/80 text-sm font-medium max-w-md">
              We&apos;ve groomed every batch on aptitude, communication, technical skills and HR-fit.
              Tell us your hiring window — we&apos;ll set up the drive.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="tel:+919691973919" className="bg-white text-[#800000] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2">
              <Phone size={13} /> Call Dean TAP · 9691973919
            </a>
            <a href="mailto:arpit.chauhan@itmuniversity.ac.in" className="bg-black/30 backdrop-blur text-white border border-white/30 text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-black/50 transition-colors inline-flex items-center justify-center gap-2">
              <Mail size={13} /> Email TAP CELL
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
