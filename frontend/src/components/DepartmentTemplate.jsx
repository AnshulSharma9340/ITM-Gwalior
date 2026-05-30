import React, { useState, useRef, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "./admin/EditableText";
import { motion, AnimatePresence, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import {
  Home,
  ChevronRight as Crumb,
  Sparkles,
  Info,
  MessageSquare,
  Compass,
  Target,
  Users,
  FlaskConical,
  Award,
  Lightbulb,
  Briefcase,
  Building2,
  Phone,
  Mail,
  ArrowRight,
  Quote,
  CheckCircle2,
  Trophy,
  GraduationCap,
  Layers,
  TrendingUp,
  Calendar,
  BookOpen,
  HandCoins,
} from "lucide-react";
import { DEPT_LIST } from "../data/departments_v2";
import EmojiToIcon from "./EmojiToIcon";
import Seo from "./Seo";

function BigNumber({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (l) => Math.round(l));
  useEffect(() => {
    if (isInView) {
      const c = animate(count, value, { duration: 1.4, ease: [0.16, 1, 0.3, 1] });
      return c.stop;
    }
  }, [isInView, value, count]);
  return (<span ref={ref}><motion.span>{rounded}</motion.span>{suffix}</span>);
}

// ─── Section icons map ─────────────────────────────────
const SECTION_ICONS = {
  about: Info,
  hod: MessageSquare,
  vision: Compass,
  mission: Target,
  peos: Lightbulb,
  psos: Layers,
  faculty: Users,
  labs: FlaskConical,
  research: BookOpen,
  projects: Trophy,
  achievements: Award,
  placement: Briefcase,
  industry: Building2,
  infra: Building2,
  consultancy: HandCoins,
  events: Calendar,
  subunits: Layers,
  contact: Phone,
};

export default function DepartmentTemplate({ dept }) {
  const pageKey = useLocation().pathname;
  if (!dept) return null;

  // Build section list dynamically based on what data exists
  const sections = useMemo(() => {
    const s = [
      { id: "about", label: "About Department" },
      ...(dept.hod ? [{ id: "hod", label: "HoD's Desk" }] : []),
      { id: "vision", label: "Vision & Mission" },
      ...(dept.peos ? [{ id: "peos", label: "PEOs · PSOs" }] : []),
      ...(dept.facultyHighlights ? [{ id: "faculty", label: "Faculty" }] : []),
      ...(dept.labs?.length ? [{ id: "labs", label: "Laboratories" }] : []),
      ...(dept.subUnits ? [{ id: "subunits", label: "Sub-Departments" }] : []),
      ...(dept.projects ? [{ id: "projects", label: "Projects" }] : []),
      ...(dept.studentAchievements ? [{ id: "achievements", label: "Achievements" }] : []),
      ...(dept.achievements ? [{ id: "achievements", label: "Highlights" }] : []),
      ...(dept.infra ? [{ id: "infra", label: "Infrastructure" }] : []),
      ...(dept.consultancy ? [{ id: "consultancy", label: "Consultancy" }] : []),
      ...(dept.events ? [{ id: "events", label: "Events" }] : []),
      ...(dept.industryPartners ? [{ id: "industry", label: "Industry Tie-ups" }] : []),
      ...(dept.placement ? [{ id: "placement", label: "Placements" }] : []),
      { id: "contact", label: "Contact" },
    ];
    // De-dupe by id
    const seen = new Set();
    return s.filter((x) => seen.has(x.id) ? false : seen.add(x.id));
  }, [dept]);

  const [active, setActive] = useState(sections[0].id);
  const otherDepts = DEPT_LIST.filter((d) => d.id !== dept.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-[#fbf7f2] dark:bg-[#020617]">

      <Seo
        title={dept?.meta?.title || `${dept?.name} — ITM Gwalior`}
        description={dept?.meta?.description || dept?.subtitle || dept?.intro}
        image={dept?.meta?.og_image || dept?.image}
        canonical={dept?.meta?.canonical_url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "EducationalOrganization",
          name: dept?.name,
          description: dept?.subtitle || dept?.intro,
          parentOrganization: { "@type": "CollegeOrUniversity", name: "ITM Gwalior" },
          url: typeof window !== "undefined" ? window.location.href : undefined,
        }}
      />

      {/* Breadcrumb */}
      <div className="bg-white dark:bg-gray-900 border-b border-rose-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
          <Link to="/" className="hover:text-[#800000] inline-flex items-center gap-1.5"><Home size={11} /> Home</Link>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-gray-400">Departments</span>
          <Crumb size={10} className="text-gray-300" />
          <span className="text-[#800000]">{dept.code}</span>
        </div>
      </div>

      {/* Compact Hero */}
      <section data-section="dept_hero" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={dept.image} alt={dept.name} className="w-full h-full object-cover" loading="eager" />
          <div className={`absolute inset-0 bg-gradient-to-br from-[#800000] to-[#3e0202] mix-blend-multiply opacity-90`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-16 text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div>
              <span className="inline-flex items-center gap-2 text-amber-200 font-bold tracking-widest text-[10px] uppercase mb-3 px-3 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20">
                <Sparkles size={12} /> {dept.badge}
              </span>
              <div className="flex items-center gap-3 sm:gap-4 mb-3">
                <span className="text-amber-200 shrink-0">
                  <EmojiToIcon emoji={dept.icon} size={32} />
                </span>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-200 mb-1">
                    <EditableText pageKey={pageKey} tkey="dept.eyebrow" as="span" value="Department of">Department of</EditableText>
                  </div>
                  <h1 className="text-xl sm:text-3xl md:text-5xl font-black tracking-[-0.04em] leading-[0.95]">
                    <EditableText pageKey={pageKey} tkey="dept.name" as="span" value={dept.name}>{dept.name}</EditableText>
                  </h1>
                </div>
              </div>
              {dept.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-white/85 max-w-2xl leading-relaxed font-medium mb-3 sm:mb-4 line-clamp-3 sm:line-clamp-none">
                  <EditableText pageKey={pageKey} tkey="dept.subtitle" as="span" multiline value={dept.subtitle}>{dept.subtitle}</EditableText>
                </p>
              )}
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-black">
                <span className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full">Est. {dept.established}</span>
                {dept.intake > 0 && <span className="px-3 py-1 bg-amber-300 text-[#1a0606] rounded-full">{dept.intake} Seats</span>}
                <span className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full">{dept.duration}</span>
              </div>
              {dept.chips && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {dept.chips.map(([icon, label]) => (
                    <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                      <EmojiToIcon emoji={icon} size={11} className="shrink-0 text-amber-200" />{label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Link to="/admissions/how-to-apply" className="inline-flex items-center gap-2 bg-white text-[#1a0606] px-4 py-2 sm:px-5 sm:py-3 rounded-full font-black text-[10px] tracking-widest uppercase hover:scale-[1.02] transition-transform shadow-xl">
                Apply Now <ArrowRight size={12} />
              </Link>
              <a href={`tel:${dept.contact.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white border border-white/30 px-4 py-2 sm:px-5 sm:py-3 rounded-full font-black text-[10px] tracking-widest uppercase hover:bg-white/20">
                <Phone size={12} /> Call
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Main Layout: Sidebar + Content ─── */}
      <section data-section="dept_main" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 md:py-12">

        {/* Mobile section bar — horizontal scroll */}
        <div className="lg:hidden mb-4 sm:mb-6 overflow-x-auto -mx-4 px-4 pb-2" style={{ scrollbarWidth: "none" }}>
          <div className="flex gap-2 w-max">
            {sections.map((s) => {
              const Icon = SECTION_ICONS[s.id] || Info;
              return (
                <button key={s.id} onClick={() => setActive(s.id)}
                  className={`relative shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors ${
                    active === s.id ? "text-white shadow-md" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}>
                  {active === s.id && <motion.span layoutId="dept-mobile-pill" className={`absolute inset-0 bg-gradient-to-r from-[#800000] to-[#3e0202] rounded-full`} transition={{ type: "spring", stiffness: 300, damping: 30 }}></motion.span>}
                  <Icon size={11} className="relative" />
                  <span className="relative">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-8">

          {/* ─── Sidebar (desktop) ─── */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-32 space-y-3">

              {/* Section Menu */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r from-[#800000] to-[#3e0202]`}></div>
                <div className="p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] mb-3 px-2">Explore</div>
                  <nav className="flex flex-col gap-0.5">
                    {sections.map((s) => {
                      const Icon = SECTION_ICONS[s.id] || Info;
                      const isActive = active === s.id;
                      return (
                        <button key={s.id} onClick={() => setActive(s.id)}
                          className={`relative text-left py-2.5 px-3 rounded-xl flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                            isActive ? "text-white" : "text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-[#800000]"
                          }`}>
                          {isActive && <motion.span layoutId="dept-side-pill" className={`absolute inset-0 bg-gradient-to-r from-[#800000] to-[#3e0202] rounded-xl shadow-md`} transition={{ type: "spring", stiffness: 320, damping: 28 }}></motion.span>}
                          <Icon size={13} className="relative shrink-0 opacity-80" />
                          <span className="relative">{s.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/20 blur-2xl"></div>
                <div className="relative">
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 mb-3">At a Glance</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-3xl font-black tracking-[-0.04em] leading-none"><BigNumber value={dept.established} /></div>
                      <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/70 mt-1">Established</div>
                    </div>
                    {dept.intake > 0 && (
                      <div>
                        <div className="text-3xl font-black tracking-[-0.04em] leading-none"><BigNumber value={dept.intake} /></div>
                        <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/70 mt-1">Annual Intake</div>
                      </div>
                    )}
                    {dept.facultyCount && (
                      <div>
                        <div className="text-3xl font-black tracking-[-0.04em] leading-none"><BigNumber value={dept.facultyCount} /></div>
                        <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/70 mt-1">Faculty Members</div>
                      </div>
                    )}
                    {dept.labs?.length > 0 && (
                      <div>
                        <div className="text-3xl font-black tracking-[-0.04em] leading-none"><BigNumber value={dept.labs.length} /></div>
                        <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/70 mt-1">Specialised Labs</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-white dark:bg-gray-900 border border-rose-50 dark:border-gray-800 rounded-3xl p-5 shadow-sm">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#800000] mb-3">Contact</div>
                <div className="space-y-2.5">
                  <a href={`tel:${dept.contact.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#800000]">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-gray-800 text-[#800000] flex items-center justify-center"><Phone size={12} /></div>
                    {dept.contact.phone}
                  </a>
                  <a href={`mailto:${dept.contact.email}`} className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-[#800000] break-all">
                    <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-gray-800 text-[#800000] flex items-center justify-center"><Mail size={12} /></div>
                    {dept.contact.email}
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* ─── Content Area ─── */}
          <main className="lg:col-span-9">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-xl overflow-hidden"
              >
                <div className={`h-1.5 bg-gradient-to-r from-[#800000] to-[#3e0202]`}></div>
                <div className="p-4 sm:p-8 md:p-10">

                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    {(() => {
                      const Icon = SECTION_ICONS[active] || Info;
                      return (
                        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#800000] to-[#3e0202] text-white flex items-center justify-center shadow-md`}>
                          <Icon size={18} />
                        </div>
                      );
                    })()}
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.25em] font-black text-[#800000]">Section</div>
                      <h2 className="text-lg sm:text-2xl md:text-3xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-tight">
                        {sections.find((s) => s.id === active)?.label}
                      </h2>
                    </div>
                  </div>

                  {/* ── ABOUT ── */}
                  {active === "about" && (
                    <div className="space-y-4 sm:space-y-6">
                      <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        <EditableText pageKey={pageKey} tkey="dept.intro" as="span" multiline value={dept.intro}>{dept.intro}</EditableText>
                      </p>

                      {/* Feature cards */}
                      {dept.features && (
                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                          {dept.features.map((f, i) => (
                            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-br from-rose-50/60 to-white dark:from-gray-800 dark:to-gray-900 border border-rose-100 dark:border-gray-700 rounded-2xl hover:shadow-md transition-shadow">
                              <span className="shrink-0 text-[#800000] dark:text-rose-300">
                                <EmojiToIcon emoji={f.icon} size={24} />
                              </span>
                              <div>
                                <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug mb-1">{f.title}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{f.sub}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      <div className="grid sm:grid-cols-3 gap-3 pt-2">
                        <div className="bg-rose-50 dark:bg-gray-800 rounded-2xl p-3 sm:p-4">
                          <div className="text-[9px] uppercase tracking-widest font-black text-[#800000] mb-1">Established</div>
                          <div className="text-xl sm:text-2xl font-black tracking-[-0.04em] text-[#1a0606] dark:text-white">{dept.established}</div>
                        </div>
                        <div className="bg-rose-50 dark:bg-gray-800 rounded-2xl p-3 sm:p-4">
                          <div className="text-[9px] uppercase tracking-widest font-black text-[#800000] mb-1">Programme Duration</div>
                          <div className="text-xl sm:text-2xl font-black tracking-[-0.04em] text-[#1a0606] dark:text-white">{dept.duration}</div>
                        </div>
                        <div className="bg-rose-50 dark:bg-gray-800 rounded-2xl p-3 sm:p-4">
                          <div className="text-[9px] uppercase tracking-widest font-black text-[#800000] mb-1">Annual Intake</div>
                          <div className="text-xl sm:text-2xl font-black tracking-[-0.04em] text-[#1a0606] dark:text-white">{dept.intake > 0 ? dept.intake : "—"}</div>
                        </div>
                      </div>

                      {dept.specializations && (
                        <div className="pt-4">
                          <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-3">Specialisations</div>
                          <div className="flex flex-wrap gap-2">
                            {dept.specializations.map((s) => (
                              <span key={s} className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 bg-gradient-to-r from-[#800000] to-[#3e0202] text-white rounded-full`}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-rose-50 dark:border-gray-800">
                        <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-3">Accreditations</div>
                        <div className="flex flex-wrap gap-2">
                          {dept.accreditations.map((a) => (
                            <span key={a} className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-black px-3 py-1.5 bg-rose-50 dark:bg-gray-800 text-[#800000] rounded-full">
                              <CheckCircle2 size={11} /> {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── HOD ── */}
                  {active === "hod" && dept.hod && (
                    <div className="relative">
                      <Quote size={120} className="absolute top-0 right-0 text-rose-50 -scale-x-100 pointer-events-none" />
                      <div className="relative">
                        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                          <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#800000] to-[#3e0202] text-white flex items-center justify-center font-black text-lg sm:text-2xl tracking-tight shadow-xl`}>
                            {dept.hod.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <h3 className="font-black text-base sm:text-xl md:text-2xl text-[#1a0606] dark:text-white tracking-tight">{dept.hod.name}</h3>
                            <p className="text-[11px] uppercase tracking-widest font-black text-[#800000] mt-1">{dept.hod.role}</p>
                            <p className="text-xs text-gray-500 font-bold mt-0.5">{dept.hod.qualification}</p>
                          </div>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic mb-4 sm:mb-6 line-clamp-6 sm:line-clamp-none">
                          &ldquo;{dept.hod.message}&rdquo;
                        </p>

                        {/* HoD Highlights */}
                        {dept.hodHighlights && (
                          <div className="grid sm:grid-cols-3 gap-3 mb-6">
                            {dept.hodHighlights.map((h, i) => (
                              <motion.div key={h.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="p-3 sm:p-4 bg-gradient-to-br from-rose-50/60 to-white dark:from-gray-800 dark:to-gray-900 border border-rose-100 dark:border-gray-700 rounded-2xl">
                                <div className="text-[#800000] dark:text-rose-300 mb-2">
                                  <EmojiToIcon emoji={h.icon} size={20} />
                                </div>
                                <h5 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug mb-1">{h.title}</h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{h.sub}</p>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {(dept.hod.phone || dept.hod.email) && (
                          <div className="flex flex-wrap gap-3 pt-5 border-t border-rose-50 dark:border-gray-800">
                            {dept.hod.phone && (
                              <a href={`tel:${dept.hod.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-gray-800 hover:bg-rose-100 dark:hover:bg-gray-700 text-[#800000] rounded-xl font-black text-xs">
                                <Phone size={13} /> {dept.hod.phone}
                              </a>
                            )}
                            {dept.hod.email && (
                              <a href={`mailto:${dept.hod.email}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-gray-800 hover:bg-rose-100 dark:hover:bg-gray-700 text-[#800000] rounded-xl font-black text-xs break-all">
                                <Mail size={13} /> {dept.hod.email}
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── VISION & MISSION ── */}
                  {active === "vision" && (
                    <div className="space-y-5">
                      <div className="relative bg-gradient-to-br from-rose-50/40 to-white dark:from-gray-800 dark:to-gray-900 border border-rose-50 dark:border-gray-700 rounded-3xl p-4 sm:p-7">
                        <div className="flex items-center gap-2 mb-3">
                          <Compass size={16} className="text-[#800000]" />
                          <span className="text-[10px] uppercase tracking-widest font-black text-[#800000]">Vision</span>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium italic">&ldquo;{dept.vision}&rdquo;</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Target size={16} className="text-amber-700" />
                          <span className="text-[10px] uppercase tracking-widest font-black text-amber-700">Mission</span>
                        </div>
                        <div className="space-y-2.5">
                          {dept.mission.map((m, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                              className="flex items-start gap-3 p-3 sm:p-4 bg-amber-50/40 dark:bg-gray-800 border border-amber-100 dark:border-gray-700 rounded-2xl">
                              <span className="shrink-0 w-7 h-7 rounded-lg bg-amber-300 text-[#1a0606] flex items-center justify-center font-black text-[10px]">M{i + 1}</span>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{m}</p>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── PEOs / PSOs ── */}
                  {active === "peos" && (dept.peos || dept.psos) && (
                    <div className="space-y-8">
                      {dept.peos && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb size={16} className="text-[#800000]" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-[#800000]">Programme Educational Objectives (PEOs)</span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {dept.peos.map((p, i) => (
                              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-white dark:bg-gray-800 border border-rose-50 dark:border-gray-700 rounded-2xl p-3 sm:p-5">
                                <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2">PEO {i + 1}</div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{p}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                      {dept.psos && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Layers size={16} className="text-amber-700" />
                            <span className="text-[10px] uppercase tracking-widest font-black text-amber-700">Programme Specific Outcomes (PSOs)</span>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {dept.psos.map((p, i) => (
                              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="bg-amber-50/40 dark:bg-gray-800 border border-amber-100 dark:border-gray-700 rounded-2xl p-3 sm:p-5">
                                <div className="text-[10px] uppercase tracking-widest font-black text-amber-700 mb-2">PSO {i + 1}</div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{p}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── FACULTY ── */}
                  {active === "faculty" && dept.facultyHighlights && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-4 sm:mb-6">
                        The department has <span className="font-black text-[#800000]">{dept.facultyCount}</span> faculty members, including senior professors and dynamic young researchers from IITs, NITs and other reputed universities.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {dept.facultyHighlights.map((f, i) => (
                          <motion.div key={f.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className="flex items-center gap-3 p-3 sm:p-4 bg-white dark:bg-gray-800 border border-rose-50 dark:border-gray-700 rounded-2xl hover:shadow-md transition-shadow">
                            <div className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#800000] to-[#3e0202] text-white flex items-center justify-center font-black text-sm tracking-tight shadow`}>
                              {f.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight truncate">{f.name}</h4>
                              <div className="text-[10px] uppercase tracking-widest font-bold text-[#800000] mt-0.5 truncate">{f.role}</div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-0.5 truncate">{f.qual}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── LABS ── */}
                  {active === "labs" && dept.labs && (
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-4 sm:mb-6">
                        <span className="font-black text-[#800000]">{dept.labs.length}</span> specialised laboratories with industry-grade equipment and software for hands-on learning.
                      </p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {dept.labs.map((lab, i) => (
                          <motion.div key={lab.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                            className="bg-gradient-to-br from-white to-rose-50/40 dark:from-gray-800 dark:to-gray-800 border border-rose-50 dark:border-gray-700 rounded-2xl p-3 sm:p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="shrink-0 text-[#800000] dark:text-rose-300">
                                <EmojiToIcon emoji={lab.icon} size={24} />
                              </div>
                              <div>
                                <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug mb-1">{lab.name}</h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{lab.desc}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {dept.software && (
                        <div className="mt-6 pt-6 border-t border-rose-50 dark:border-gray-800">
                          <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-3">Industry Software</div>
                          <div className="flex flex-wrap gap-2">
                            {dept.software.map((s) => (
                              <span key={s} className="text-xs font-black tracking-tight px-3 py-1.5 bg-rose-50 dark:bg-gray-800 text-[#800000] rounded-full">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── SUB-UNITS (ESH only) ── */}
                  {active === "subunits" && dept.subUnits && (
                    <div className="space-y-4">
                      {dept.subUnits.map((u) => (
                        <div key={u.name} className="bg-gradient-to-br from-white to-rose-50/40 dark:from-gray-800 dark:to-gray-800 border border-rose-50 dark:border-gray-700 rounded-2xl p-3 sm:p-6">
                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="shrink-0 text-[#800000] dark:text-rose-300">
                              <EmojiToIcon emoji={u.icon} size={32} />
                            </div>
                            <div>
                              <h3 className="font-black text-base sm:text-lg text-[#1a0606] dark:text-white tracking-tight mb-1 sm:mb-2">{u.name}</h3>
                              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium mb-2 sm:mb-3 line-clamp-4 sm:line-clamp-none">{u.desc}</p>
                              {u.research && (
                                <div className="text-xs text-emerald-700 font-bold italic bg-emerald-50 rounded-xl px-3 py-2 flex items-center gap-1">
                                  <EmojiToIcon emoji="💡" size={13} className="shrink-0" /> {u.research}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── PROJECTS ── */}
                  {active === "projects" && dept.projects && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {dept.projects.map((p, i) => (
                        <motion.div key={p.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="bg-gradient-to-br from-amber-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 border border-amber-100 dark:border-gray-700 rounded-2xl p-3 sm:p-5">
                          <Trophy size={20} className="text-amber-700 mb-3" />
                          <h4 className="font-black text-base text-[#1a0606] dark:text-white tracking-tight leading-snug mb-2">{p.title}</h4>
                          <p className="text-xs text-amber-800 font-bold leading-relaxed">{p.note}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── ACHIEVEMENTS (ECE) ── */}
                  {active === "achievements" && dept.studentAchievements && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {dept.studentAchievements.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                          className="bg-gradient-to-br from-amber-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 border border-amber-100 dark:border-gray-700 rounded-2xl p-3 sm:p-5">
                          <Award size={18} className="text-amber-700 mb-3" />
                          <h4 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug mb-1">{s.name}</h4>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-800">{s.award}</p>
                          {s.batch && <p className="text-[10px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mt-1">Batch · {s.batch}</p>}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── HIGHLIGHTS (IT, MBA) ── */}
                  {active === "achievements" && !dept.studentAchievements && dept.achievements && (
                    <div className="space-y-2.5">
                      {dept.achievements.map((a, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-br from-rose-50/40 to-white dark:from-gray-800 dark:to-gray-800 border border-rose-50 dark:border-gray-700 rounded-2xl">
                          <CheckCircle2 size={18} className="text-[#800000] shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{a}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── INFRA (MBA) ── */}
                  {active === "infra" && dept.infra && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {dept.infra.map((i, idx) => (
                        <motion.div key={i.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                          className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-rose-50 dark:border-gray-700 rounded-2xl p-3 sm:p-4 hover:shadow-md transition-shadow">
                          <span className="text-[#800000] dark:text-rose-300">
                            <EmojiToIcon emoji={i.icon} size={24} />
                          </span>
                          <span className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight">{i.name}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── CONSULTANCY (MBA) ── */}
                  {active === "consultancy" && dept.consultancy && (
                    <div className="overflow-hidden rounded-2xl border border-rose-50 dark:border-gray-700">
                      <table className="w-full text-sm">
                        <thead className={`bg-gradient-to-r from-[#800000] to-[#3e0202] text-white`}>
                          <tr>
                            <th className="text-left p-4 text-[10px] uppercase tracking-widest font-black">Client</th>
                            <th className="text-left p-4 text-[10px] uppercase tracking-widest font-black">Project</th>
                            <th className="text-right p-4 text-[10px] uppercase tracking-widest font-black">Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dept.consultancy.map((c, i) => (
                            <tr key={i} className="border-t border-rose-50 dark:border-gray-700 hover:bg-rose-50/30 dark:hover:bg-gray-700/30">
                              <td className="p-4 font-black text-[#1a0606] dark:text-white tracking-tight">{c.client}</td>
                              <td className="p-4 text-xs text-gray-700 dark:text-gray-300 font-medium">{c.project}</td>
                              <td className="p-4 text-right font-black text-[#800000] tracking-tight">{c.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── EVENTS (MBA) ── */}
                  {active === "events" && dept.events && (
                    <div className="space-y-2.5">
                      {dept.events.map((e, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                          className="flex items-start gap-3 p-4 bg-gradient-to-br from-amber-50/40 to-white dark:from-gray-800 dark:to-gray-800 border border-amber-100 dark:border-gray-700 rounded-2xl">
                          <BookOpen size={16} className="text-amber-700 shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{e}</p>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── INDUSTRY ── */}
                  {active === "industry" && dept.industryPartners && (
                    <div className="space-y-5">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-3">Industry Recruiters</div>
                        <div className="flex flex-wrap gap-2">
                          {dept.industryPartners.map((p) => (
                            <span key={p} className="inline-flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-gray-800 border border-rose-50 dark:border-gray-700 rounded-xl text-xs font-black text-[#1a0606] dark:text-white">
                              <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-[#800000] to-amber-500"></span>
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                      {dept.govPartners && (
                        <div className="pt-4 border-t border-rose-50 dark:border-gray-800">
                          <div className="text-[10px] uppercase tracking-widest font-black text-emerald-700 mb-3">Government / PSU</div>
                          <div className="flex flex-wrap gap-2">
                            {dept.govPartners.map((p) => (
                              <span key={p} className="text-[10px] uppercase tracking-widest font-black px-2.5 py-1.5 bg-emerald-50 dark:bg-gray-800 text-emerald-700 rounded">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {dept.industrialVisits && (
                        <div className="pt-4 border-t border-rose-50 dark:border-gray-800">
                          <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-3">Industrial Visits</div>
                          <ul className="space-y-2">
                            {dept.industrialVisits.map((v, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#800000] mt-2"></span>
                                {v}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── PLACEMENT ── */}
                  {active === "placement" && dept.placement && (
                    <div className="space-y-4 sm:space-y-5">
                      {dept.placement.desc && (
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{dept.placement.desc}</p>
                      )}

                      {/* Stats grid */}
                      {dept.placement.stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {dept.placement.stats.map((s, i) => (
                            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="relative overflow-hidden bg-gradient-to-br from-[#1a0606] via-[#3e0202] to-[#800000] text-white rounded-2xl p-3 sm:p-5">
                              <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.04em] leading-none mb-2">{s.value}</div>
                              <div className="text-[9px] uppercase tracking-widest font-black text-rose-100/80">{s.label}</div>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Highlight cards */}
                      {dept.placement.highlights && (
                        <div className="grid sm:grid-cols-3 gap-3">
                          {dept.placement.highlights.map((h, i) => (
                            <motion.div key={h.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="p-3 sm:p-5 bg-gradient-to-br from-rose-50/60 to-white dark:from-gray-800 dark:to-gray-800 border border-rose-100 dark:border-gray-700 rounded-2xl">
                              <div className="text-[#800000] dark:text-rose-300 mb-2 sm:mb-3">
                                <EmojiToIcon emoji={h.icon} size={24} />
                              </div>
                              <h5 className="font-black text-sm text-[#1a0606] dark:text-white tracking-tight leading-snug mb-1">{h.title}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{h.sub}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {/* Recruiter chip cloud */}
                      {dept.placement.recruiters && (
                        <div className="pt-2">
                          <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-3">Top Recruiters</div>
                          <div className="flex flex-wrap gap-1.5">
                            {dept.placement.recruiters.map((r) => (
                              <span key={r} className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-3 py-1.5 bg-rose-50 dark:bg-gray-800 text-[#800000] rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#800000]"></span>{r}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── CONTACT ── */}
                  {active === "contact" && (
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <a href={`tel:${dept.contact.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-rose-50 dark:bg-gray-800 rounded-2xl hover:bg-rose-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-gray-700 text-[#800000] flex items-center justify-center shadow"><Phone size={20} /></div>
                        <div>
                          <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">Phone</div>
                          <div className="text-base font-black text-[#1a0606] dark:text-white">{dept.contact.phone}</div>
                        </div>
                      </a>
                      <a href={`mailto:${dept.contact.email}`} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-rose-50 dark:bg-gray-800 rounded-2xl hover:bg-rose-100 dark:hover:bg-gray-700 transition-colors">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-gray-700 text-[#800000] flex items-center justify-center shadow"><Mail size={20} /></div>
                        <div className="min-w-0">
                          <div className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400">Email</div>
                          <div className="text-base font-black text-[#1a0606] dark:text-white break-all">{dept.contact.email}</div>
                        </div>
                      </a>
                      <div className="sm:col-span-2 p-3 sm:p-5 bg-gradient-to-br from-rose-50/40 to-white dark:from-gray-800 dark:to-gray-800 border border-rose-50 dark:border-gray-700 rounded-2xl">
                        <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-2">Campus Address</div>
                        <p className="text-sm font-bold text-[#1a0606] dark:text-white leading-relaxed">ITM Campus, NH-75 Sithouli, Jhansi Road, Gwalior – 475001, M.P., India</p>
                      </div>
                    </div>
                  )}

                </div>
              </motion.div>
            </AnimatePresence>

            {/* Other departments cross-link */}
            <div className="mt-6 sm:mt-10">
              <div className="text-[10px] uppercase tracking-widest font-black text-[#800000] mb-3 sm:mb-4">Explore other departments</div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {otherDepts.map((d) => (
                  <Link key={d.id} to={d.subPath} className="group text-center p-2 sm:p-3 bg-white dark:bg-gray-800 border border-rose-50 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-[#800000] transition-all">
                    <div className="text-gray-600 dark:text-gray-300 group-hover:text-[#800000] dark:group-hover:text-rose-300 mb-1 group-hover:scale-110 transition-transform flex justify-center">
                      <EmojiToIcon emoji={d.icon} size={20} />
                    </div>
                    <div className="text-[9px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 group-hover:text-[#800000]">{d.code}</div>
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
