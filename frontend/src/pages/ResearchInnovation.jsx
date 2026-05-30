import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "../components/admin/EditableText";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  Rocket,
  Compass,
  Target,
  Mail,
  Phone,
  Calendar,
  Award,
  Users,
  Lightbulb,
  Shield,
  Briefcase,
  Building2,
  Filter,
  ArrowRight,
} from "lucide-react";

const RESEARCH_SUBNAV = [
  { label: "R&D Cell", to: "/research/rd-cell" },
  { label: "Innovation Ecosystem", to: "/research/innovation-ecosystem", active: true },
  { label: "ITM Journal", to: "/research/journal" },
  { label: "International Conference", to: "/research/conference" },
  { label: "FDP", to: "/research/fdp" },
];

const IDEAPAD = {
  desc: "IDEAPAD is the business incubator in ITM. It is envisioned that if various streams of ITM group and students concentrate on solving issues related to the region, their communities, the success of these experiments can be scaled commercially into an enterprise.",
  foundation: "ITM Business and Incubator Foundation, established in 2021, is dedicated to helping students transform their ideas into innovations, serving as a launchpad for entrepreneurial endeavors.",
  vision: "IDEAPAD envisions a fertile ground where innovative sparks ignite, nurturing entrepreneurs to craft their visionary ideas into thriving, sustainable ventures.",
  mission: "IDEAPAD's mission typically revolves around fostering the growth and success of startups and small businesses.",
};

const IDEAPAD_FACILITIES = [
  { icon: "🏢", title: "Workspace" },
  { icon: "📶", title: "High Speed Internet" },
  { icon: "🎓", title: "Mentorship & Expert Guidance" },
  { icon: "📑", title: "Business Plan Development" },
  { icon: "📣", title: "Marketing & Branding Support" },
  { icon: "⚖️", title: "Legal Assistance (Registration · IPR)" },
  { icon: "💰", title: "Funding & Investor Connections" },
  { icon: "🤝", title: "Networking Support" },
  { icon: "🔬", title: "Lab Facilities" },
];

const NISP_FEATURES = [
  "Creation of 'Innovation Fund' for supporting innovative projects and Start-ups by allocating minimum 1% of institution's total budget.",
  "Academic break for a semester / year to work on startups. Credits for working on innovative prototype / business models.",
  "2% – 9.5% equity / stake in startup / company by institute's incubator.",
  "Complete ownership of IPR by the inventors in case of non-usage of institute's facilities or resources.",
  "Services to be offered by institution in lieu of equity, fee-based or zero-payment model.",
];

const NISP_STEERING = [
  { name: "Dr. Manoj K. Bandil", role: "Convener (NISP)" },
  { name: "Dr. Shahid Amin", role: "Member" },
  { name: "Mr. Rajkumar Rajoria", role: "Member" },
  { name: "Dr. Ankit Gupta", role: "Member" },
  { name: "Mr. Biswajit Majumder", role: "Member" },
  { name: "Ms. Priusha Narwariya", role: "Member" },
];

const IIC_COUNCIL = [
  { name: "Dr. Meenakshi Mazumdar", role: "Chairperson", dept: "Director ITM", email: "" },
  { name: "Dr. Shahid Amin", role: "President", dept: "Management", email: "shahid.amin.mba@itmgoi.in" },
  { name: "Mr. Ashish Chandel", role: "Vice President", dept: "Management", email: "" },
  { name: "Mr. Narottam Dutt Upadhyay", role: "Convener", dept: "ECE", email: "narottamduttupadhay.ee@itmgoi.in" },
  { name: "Mr. Rajkumar Rajoria", role: "Innovation Coordinator", dept: "ECE", email: "rk.rajoria@itmgoi.in" },
  { name: "Dr. Shushant Ku. Jain", role: "IPR Coordinator", dept: "ECE", email: "sushant.jain@itmgoi.in" },
  { name: "Ms. Priusha Narwaria", role: "NIRF Coordinator", dept: "CSE", email: "priusha.narwaria@itmgoi.in" },
  { name: "Mr. Amit Jain", role: "Social Media Coordinator", dept: "ME", email: "amit.jain@itmgoi.in" },
  { name: "Mr. Mukesh Hemnani", role: "Startup Coordinator", dept: "ME", email: "mukeshhemnani.me@itmgoi.in" },
  { name: "Mr. Biswajit Majumder", role: "Internship Coordinator", dept: "TPO", email: "biswajit.majumdar@itmgoi.in" },
  { name: "Mr. Akash Kumar Shukla", role: "Yukti Coordinator", dept: "IdeaPad", email: "akashkumarshukla@itmgoi.in" },
  { name: "Dr. Archana Tomar", role: "Member", dept: "CSE", email: "archna.tomar@itmgoi.in" },
  { name: "Dr. Ankit Gupta", role: "Member", dept: "Management", email: "ankitgupta.mba@itmgoi.in" },
  { name: "Mr. Ankit Shrivastava", role: "Member", dept: "CE", email: "ankitshrivastava.civil@itmgoi.in" },
  { name: "Ms. Saivya Bhadoriya", role: "Member", dept: "Basic Science", email: "saivya.bhadouriya@itmgoi.in" },
  { name: "Ms. Vishakha Yadav", role: "Member", dept: "CE", email: "vishakhayadav.civil@itmgoi.in" },
  { name: "Mr. Akbar Shah", role: "Member", dept: "Basic Science", email: "akbbarshah.science@itmgoi.in" },
  { name: "Mr. Gaurav Dubey", role: "Member", dept: "CSE", email: "gaurav.dubey@itmgoi.in" },
  { name: "Mr. Sanjay Pathak", role: "Member", dept: "IT", email: "sanjaypathak.it@itmgoi.in" },
];

const EDC = {
  vision: "The Entrepreneurship Development Cell (EDC) at ITM is established with a vision of fostering innovation and promoting entrepreneurial skills among students.",
  mission: "Entrepreneurship Development Cell strives to inspire and integrate a culture of innovation through a conducive entrepreneurial ecosystem to help budding entrepreneurs realize their dream to start up their own enterprises.",
  programs: [
    { icon: "🎯", title: "Entrepreneurship Awareness Camps (EAC)" },
    { icon: "📈", title: "Entrepreneurship Development Programs (EDP)" },
    { icon: "🔥", title: "Entrepreneurship Motivation Programs (EMP)" },
    { icon: "👨‍🏫", title: "Faculty Development Programs (FDP)" },
    { icon: "🛠️", title: "Skill Development Programs (SDP)" },
  ],
};

const ACTIVITIES = [
  { date: "13 Dec 2024", type: "Self-Driven", title: "Cultivating Ethical and Innovative Mindsets in Future Engineering Leaders" },
  { date: "30 Dec 2024", type: "Self-Driven", title: "Alumni Expert Talk: Role of Cloud and AI in Shaping IT Industry" },
  { date: "30 Dec 2024", type: "IIC Calendar", title: "Workshop on Design Thinking, Critical Thinking and Innovation Design" },
  { date: "03 Jan 2025", type: "IIC Calendar", title: "Expert Talk on Process of Innovation Development & TRL" },
  { date: "07-09 Jan 2025", type: "IIC Calendar", title: "Innovation Showcase: Demo Day / Exhibition / Poster Presentation" },
  { date: "12 Jan 2025", type: "Celebration", title: "National Youth Day" },
  { date: "31 Jan 2025", type: "IIC Calendar", title: "Workshop on Effective Sales and Marketing Strategies for Entrepreneurs" },
  { date: "28 Feb 2025", type: "Celebration", title: "National Science Day" },
];

const IIC_SOCIALS = [
  { label: "LinkedIn", handle: "IIC ITM Gwalior", url: "https://www.linkedin.com/company/iic-itm-gwalior" },
  { label: "Facebook", handle: "IIC ITM Gwalior", url: "https://www.facebook.com/iicitmgwalior" },
  { label: "Instagram", handle: "@iicitmgwalior", url: "https://www.instagram.com/iicitmgwalior" },
  { label: "YouTube", handle: "@IICITMGwl", url: "https://www.youtube.com/@IICITMGwl" },
];

export default function ResearchInnovation() {
  const pageKey = useLocation().pathname;
  const [filter, setFilter] = useState("All");
  const filterOpts = ["All", ...new Set(ACTIVITIES.map((a) => a.type))];
  const filtered = filter === "All" ? ACTIVITIES : ACTIVITIES.filter((a) => a.type === filter);

  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5"><Home size={11} /> Home</Link>
          <Crumb size={10} className="text-gray-300" />
          <Link to="/research" className="hover:text-[#800000]">Research</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">Innovation Ecosystem</span>
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
      <section data-section="innov_hero" className="relative overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-10 right-20 w-72 h-72 rounded-full border-2 border-white"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 md:py-20 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-red-200 font-bold tracking-widest text-[10px] uppercase mb-4 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
              <Rocket size={12} /> IDEAPAD · IIC 8.0 · NISP · EDC
            </span>
            <h1 className="text-2xl sm:text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] mb-4">
              <EditableText pageKey={pageKey} tkey="innov.title.line1" as="span" value="Innovation">Innovation</EditableText><br />
              <EditableText pageKey={pageKey} tkey="innov.title.line2" as="span" value="Ecosystem." className="text-red-200">Ecosystem.</EditableText>
            </h1>
            <p className="text-red-100/80 text-sm sm:text-base max-w-xl leading-relaxed font-medium">
              <EditableText pageKey={pageKey} tkey="innov.intro" as="span" multiline
                value="Our campus incubator, Innovation Council, NISP Steering Committee and Entrepreneurship Development Cell — one ecosystem turning student ideas into ventures.">
                Our campus incubator, Innovation Council, NISP Steering Committee and Entrepreneurship Development Cell
                — one ecosystem turning student ideas into ventures.
              </EditableText>
            </p>
          </div>
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black tracking-[-0.04em] leading-none">2021</div>
              <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-2">IDEAPAD Founded</div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black tracking-[-0.04em] leading-none">{IIC_COUNCIL.length}</div>
              <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-2">IIC Members</div>
            </div>
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black tracking-[-0.04em] leading-none">8</div>
              <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80 mt-2">Recent Activities</div>
            </div>
          </div>
        </div>
      </section>

      {/* IDEAPAD */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Campus Incubator</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05] mb-4">IDEAPAD</h2>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">{IDEAPAD.desc}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium italic">{IDEAPAD.foundation}</p>
        </div>

        {/* Vision + Mission split */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-4 sm:p-7 shadow-sm">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-[#800000] to-[#5a0000] text-white flex items-center justify-center mb-4"><Compass size={20} /></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000] mb-2">IDEAPAD Vision</div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">&ldquo;{IDEAPAD.vision}&rdquo;</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-4 sm:p-7 shadow-sm">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-700 text-white flex items-center justify-center mb-4"><Target size={20} /></div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700 dark:text-amber-400 mb-2">IDEAPAD Mission</div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">&ldquo;{IDEAPAD.mission}&rdquo;</p>
          </div>
        </div>

        {/* Facilities */}
        <div>
          <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-4">What IDEAPAD provides</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {IDEAPAD_FACILITIES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-2xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{f.icon}</div>
                <div className="text-xs font-black text-[#1a0606] dark:text-white tracking-tight leading-snug">{f.title}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-10 grid md:grid-cols-2 gap-3">
          <a href="mailto:iic@itmgoi.in" className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-gray-800 rounded-2xl hover:bg-rose-100 dark:hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 text-[#800000] flex items-center justify-center"><Mail size={18} /></div>
            <div><div className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">Email</div><div className="text-sm font-black text-[#1a0606] dark:text-white">iic@itmgoi.in</div></div>
          </a>
          <a href="tel:+917889961796" className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-gray-800 rounded-2xl hover:bg-rose-100 dark:hover:bg-gray-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 text-[#800000] flex items-center justify-center"><Phone size={18} /></div>
            <div><div className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">Phone</div><div className="text-sm font-black text-[#1a0606] dark:text-white">+91-7889961796</div></div>
          </a>
        </div>
      </section>

      {/* NISP */}
      <section className="bg-[#1a0606] text-white py-8 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-2xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-300/30 mb-4">
              <Shield size={12} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">National Innovation & Startup Policy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05]">
              NISP at ITM
            </h2>
            <p className="text-sm text-rose-100/70 mt-3 font-medium leading-relaxed">
              Launched 11 September 2019 by AICTE — ITM Gwalior implements the National Innovation and Startup Policy
              for students and faculty in higher education institutions.
            </p>
          </div>

          {/* NISP key features */}
          <div className="grid md:grid-cols-2 gap-4 mb-12">
            {NISP_FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-lg bg-amber-300 text-[#1a0606] flex items-center justify-center font-black text-[10px]">{String(i + 1).padStart(2, "0")}</span>
                  <p className="text-sm text-white/85 leading-relaxed font-medium">{f}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* NISP Steering committee */}
          <div>
            <div className="text-[10px] uppercase tracking-widest font-black text-amber-300 mb-4 flex items-center gap-2">
              <Users size={12} /> NISP Steering Committee · 6 members
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {NISP_STEERING.map((m) => (
                <div key={m.name} className="bg-white/[0.04] backdrop-blur border border-white/10 rounded-2xl p-4">
                  <div className="text-[9px] uppercase tracking-widest font-black text-amber-300 mb-1">{m.role}</div>
                  <div className="font-black text-sm tracking-tight">{m.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* IIC 8.0 Council */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">IIC 8.0 · 2025-26</span>
            <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
            Institution&apos;s Innovation Council
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 font-medium leading-relaxed">
            Established under MoE&apos;s Innovation Cell in collaboration with AICTE to systematically foster a culture
            of innovation and startup ecosystem.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-[#3e0202] to-[#800000] text-white">
                <tr>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em] w-12">#</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em]">Name</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em]">Role</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em]">Department</th>
                  <th className="text-left p-4 text-[10px] font-black uppercase tracking-[0.25em]">Email</th>
                </tr>
              </thead>
              <tbody>
                {IIC_COUNCIL.map((m, i) => (
                  <tr key={m.name} className="border-t border-rose-50 dark:border-gray-800 hover:bg-rose-50/40 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">{String(i + 1).padStart(2, "0")}</td>
                    <td className="p-4 font-black text-[#1a0606] dark:text-white tracking-tight">{m.name}</td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 bg-rose-50 dark:bg-gray-800 text-[#800000] rounded">{m.role}</span>
                    </td>
                    <td className="p-4 text-xs font-bold text-gray-600 dark:text-gray-400">{m.dept}</td>
                    <td className="p-4 text-xs text-gray-600 dark:text-gray-400 font-medium">
                      {m.email ? <a href={`mailto:${m.email}`} className="hover:text-[#800000] break-all">{m.email}</a> : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* IIC Social Media */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">Follow IIC ITM:</span>
          {IIC_SOCIALS.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-full text-xs font-black text-[#1a0606] dark:text-white hover:border-[#800000] hover:text-[#800000] transition-colors">
              {s.label} <span className="text-gray-400 font-medium text-[10px]">{s.handle}</span>
            </a>
          ))}
        </div>
      </div>

      {/* EDC */}
      <section className="bg-white dark:bg-gray-900 border-y border-rose-100 dark:border-gray-800 py-8 sm:py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Entrepreneurship Development Cell</span>
              <div className="w-8 h-1 bg-gradient-to-r from-amber-500 to-[#800000] rounded-full"></div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">EDC</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            <div className="bg-gradient-to-br from-rose-50/40 dark:from-gray-900 to-white dark:to-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-4 sm:p-7">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000] mb-2">EDC Vision</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">&ldquo;{EDC.vision}&rdquo;</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50/40 dark:from-gray-900 to-white dark:to-gray-900 border border-amber-100 dark:border-gray-800 rounded-3xl p-4 sm:p-7">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-700 dark:text-amber-400 mb-2">EDC Mission</div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">&ldquo;{EDC.mission}&rdquo;</p>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-4">5 Programmes organised by EDC</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {EDC.programs.map((p, i) => (
                <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                  className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-2xl p-5 text-center hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-2">{p.icon}</div>
                  <div className="text-xs font-black text-[#1a0606] dark:text-white tracking-tight leading-snug">{p.title}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Activities timeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 sm:mb-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">Activities Calendar</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              Recent &amp; upcoming activities.
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <Filter size={12} className="text-gray-400 mr-1" />
            {filterOpts.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${filter === f ? "bg-[#800000] text-white shadow" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filtered.map((a, i) => (
            <motion.div key={`${a.date}-${a.title}`} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-2xl hover:shadow-md transition-shadow group">
              <div className="shrink-0 w-20 text-center">
                <div className="text-xs font-black text-[#800000] tracking-tight">{a.date}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                    a.type === "IIC Calendar" ? "bg-rose-50 dark:bg-gray-800 text-[#800000]" :
                    a.type === "Self-Driven" ? "bg-amber-50 dark:bg-gray-800 text-amber-700 dark:text-amber-400" :
                    "bg-emerald-50 dark:bg-gray-800 text-emerald-700 dark:text-emerald-400"
                  }`}>{a.type}</span>
                </div>
                <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug">{a.title}</h4>
              </div>
              <Calendar size={16} className="text-gray-300 shrink-0" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] text-white p-4 sm:p-8 md:p-12 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-amber-300 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 rounded-full border border-white/20">
              <Lightbulb size={12} /> Have a startup idea?
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter mb-3">Apply to IDEAPAD.</h3>
            <p className="text-rose-100/80 text-sm font-medium max-w-md">
              Workspace, mentorship, IP support, funding access and an entire campus that wants you to win.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a href="mailto:iic@itmgoi.in" className="bg-amber-300 text-[#1a0606] text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:scale-[1.02] transition-transform inline-flex items-center justify-center gap-2">
              <Mail size={13} /> Apply via iic@itmgoi.in
            </a>
            <a href="tel:+917889961796" className="bg-black/30 backdrop-blur text-white border border-white/30 text-center font-black text-xs tracking-widest px-6 py-4 rounded-2xl hover:bg-black/50 transition-colors inline-flex items-center justify-center gap-2">
              <Phone size={13} /> +91-7889961796
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
