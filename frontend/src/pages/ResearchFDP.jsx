import React from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  Users,
  Calendar,
  Mail,
  Phone,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Award,
  CheckCircle2,
  ExternalLink,
  Briefcase,
} from "lucide-react";

const RESEARCH_SUBNAV = [
  { label: "R&D Cell", to: "/research/rd-cell" },
  { label: "Innovation Ecosystem", to: "/research/innovation-ecosystem" },
  { label: "ITM Journal", to: "/research/journal" },
  { label: "International Conference", to: "/research/conference" },
  { label: "FDP", to: "/research/fdp", active: true },
];

const FDP = {
  title: "Enhancing Inclusive Workspaces: Integrating Gender Sensitivity and Cyber Hygiene in Academia",
  type: "One Week National FDP",
  mode: "Hybrid Mode",
  duration: "7 days",
  dates: "June 17 – 23, 2025",
  fee: "₹299",
  deadline: "June 15, 2025",
  department: "Department of Management, Institute of Technology & Management, Gwalior",
  registrationLink: "https://forms.gle/h75Vf3mDPrzTt79A8",
  convenor: { name: "Dr. Divya Sharma", role: "Convenor", phone: "+91-9826481317" },
  coordinator: { name: "Dr. Alka Sanyal", role: "Coordinator", phone: "+91-9826268454" },
  modules: [
    "Foundations of Inclusive Workspaces",
    "Understanding Gender Sensitivity",
    "Creating a Gender-Sensitive Academic Culture",
    "Introduction to Cyber Hygiene in Academia",
    "Gender and Safety in Digital Spaces",
  ],
  resourcePersons: [
    { name: "Prof. (Dr.) Vijaya Rani Dhoundiyal", role: "Former Dean & HOD, Faculty of Education", inst: "S.S.J. University, Almora", accent: "from-rose-500 to-[#800000]" },
    { name: "Dr. Avnish Vijay", role: "Asst. Director & Associate Professor, Management", inst: "Manipal University, Jaipur", accent: "from-amber-500 to-orange-600" },
    { name: "Dr. Kanak Sharma", role: "Asst. Professor, Department of Education", inst: "Central University of Rajasthan", accent: "from-emerald-500 to-teal-700" },
    { name: "Dr. Vasudev Singh Jadon", role: "Asst. Professor of Sociology", inst: "Govt. P.G. College, Datia", accent: "from-indigo-500 to-violet-700" },
    { name: "Prof. Ritu Sapra", role: "Professor, Department of Commerce", inst: "University of Delhi", accent: "from-sky-500 to-blue-700" },
    { name: "Prof. Naveen Mathur", role: "Professor & Head, Department of Business Administration", inst: "University of Rajasthan", accent: "from-pink-500 to-rose-700" },
  ],
};

const HIGHLIGHTS = [
  { icon: "📚", title: "Course Modules", value: "5 sessions" },
  { icon: "🎓", title: "Resource Persons", value: "6 experts" },
  { icon: "📜", title: "E-Certificate", value: "On completion" },
  { icon: "👥", title: "Target Audience", value: "Academicians" },
];

const FDP_GALLERY = Array.from({ length: 8 }, (_, i) =>
  `https://www.itmgoi.in/include/gallery/fdp_Pics/fdp_0${i + 1}.jpeg`
);
const FDP_DOC_URL = "https://www.itmgoi.in/IQAC/Conf_FDP/National_FDP_ITM.pdf";
const FDP_BANNER = "https://www.itmgoi.in/IQAC/Conf_FDP/Fdp.jpg";

export default function ResearchFDP() {
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
          <span className="text-[#800000]">FDP</span>
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
      <section data-section="fdp_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 md:py-20">
          <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
            <Sparkles size={12} /> {FDP.type} · {FDP.mode}
          </span>
          <h1 className="text-xl sm:text-4xl md:text-6xl font-black tracking-[-0.04em] leading-[1] mb-4 max-w-4xl">
            <EditableText pageKey={pageKey} tkey="fdp.title" as="span" value={FDP.title}>{FDP.title}</EditableText>
          </h1>
          <div className="flex flex-wrap gap-2 mb-7">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-black">
              <Calendar size={12} /> {FDP.dates}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-300 text-[#1a0606] rounded-full text-xs font-black">
              Fee · {FDP.fee}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-black">
              Deadline · {FDP.deadline}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={FDP.registrationLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white text-[#800000] px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:scale-[1.02] transition-transform shadow-xl">
              Register Now <ExternalLink size={13} />
            </a>
            <a href={`tel:${FDP.convenor.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-4 py-2.5 sm:px-6 sm:py-3 rounded-full font-black text-[11px] tracking-widest uppercase hover:bg-white/20">
              <Phone size={13} /> Call Convenor
            </a>
          </div>
        </div>
      </section>

      {/* Highlights strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-3 -mt-6 relative z-10">
        {HIGHLIGHTS.map((h, i) => (
          <motion.div key={h.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl p-3 sm:p-5">
            <div className="text-3xl mb-2">{h.icon}</div>
            <div className="text-lg font-black tracking-tight text-[#1a0606] dark:text-white leading-none">{h.value}</div>
            <div className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 mt-1">{h.title}</div>
          </motion.div>
        ))}
      </section>

      {/* Organising team + Department */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-rose-50/40 dark:from-gray-900 to-white dark:to-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-4 sm:p-7">
            <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2 flex items-center gap-1.5"><Briefcase size={11} /> Organising Department</div>
            <h3 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight leading-snug">{FDP.department}</h3>
          </div>
          <a href={FDP_DOC_URL} target="_blank" rel="noreferrer"
            className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-4 sm:p-7 hover:shadow-xl transition-shadow flex flex-col justify-between group">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2 flex items-center gap-1.5"><ArrowUpRight size={11} /> Official Brochure</div>
              <h3 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight leading-snug mb-2">National FDP Document</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Download the official FDP brochure and programme schedule.</p>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#800000] group-hover:gap-3 transition-all">
              Download PDF <ArrowUpRight size={11} />
            </div>
          </a>
          {[FDP.convenor, FDP.coordinator].map((person) => (
            <div key={person.name} className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-4 sm:p-7 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-white flex items-center justify-center font-black text-sm">
                  {person.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest font-black text-[#800000]">{person.role}</div>
                  <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight">{person.name}</h4>
                </div>
              </div>
              <a href={`tel:${person.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#800000]">
                <Phone size={11} className="text-[#800000]" /> {person.phone}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Course modules */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Course Modules · 5 sessions</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              What you&apos;ll cover in 7 days.
            </h2>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            {FDP.modules.map((m, i) => (
              <motion.div key={m} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 p-5 bg-gradient-to-br from-rose-50/40 dark:from-gray-900 to-white dark:to-gray-900 border border-rose-50 dark:border-gray-800 rounded-2xl hover:shadow-md transition-shadow">
                <span className="shrink-0 w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-white flex items-center justify-center font-black text-sm tracking-tight">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight leading-snug">{m}</h4>
                  <div className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mt-1">Day {i + 1} · Session</div>
                </div>
                <CheckCircle2 size={18} className="text-[#800000] shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resource persons */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Expert Resource Persons</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Six experts from leading institutions.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FDP.resourcePersons.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
              className="relative overflow-hidden bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-3 sm:p-6 hover:shadow-xl transition-shadow">
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${p.accent}`}></div>
              <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${p.accent} text-white flex items-center justify-center font-black text-sm tracking-tight shadow-lg mb-4 mt-2`}>
                {p.name.replace(/[^A-Z]/g, "").slice(0, 2) || p.name.slice(0, 2).toUpperCase()}
              </div>
              <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight leading-snug mb-2">{p.name}</h4>
              <p className="text-xs font-bold text-[#800000] mb-2">{p.role}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{p.inst}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FDP Gallery */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">FDP Gallery</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Program highlights.
            </h2>
          </div>
          <div className="mb-4 rounded-2xl overflow-hidden max-h-64">
            <img src={FDP_BANNER} alt="FDP Official Banner" className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FDP_GALLERY.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl">
                <img src={src} alt={`FDP activity ${i + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white p-4 sm:p-8 md:p-12 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-amber-300 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <Award size={12} /> Register before June 15
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-3">Just ₹299 for a week.</h3>
            <p className="text-rose-100/80 text-sm font-medium max-w-md">
              E-Certificates issued on successful completion. Open to academicians, educational strategists and professionals in digital academic practices.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href={FDP.registrationLink} target="_blank" rel="noreferrer" className="bg-amber-300 text-[#1a0606] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2">
              Register on Google Forms <ExternalLink size={13} />
            </a>
            <a href={`tel:${FDP.convenor.phone.replace(/[^+\d]/g, "")}`} className="bg-black/30 backdrop-blur text-white border border-white/30 text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-black/50 transition-colors inline-flex items-center justify-center gap-2">
              <Phone size={13} /> Call Dr. Divya Sharma
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
