import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  FlaskConical,
  Cpu,
  MapPin,
  Users,
} from "lucide-react";
import EditableText from "./admin/EditableText";

function Counter({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (l) => Math.round(l).toLocaleString());

  const numeric = parseInt(String(value).replace(/[^0-9]/g, "")) || 0;
  const prefix = String(value).match(/^[^\d]+/)?.[0] || "";
  const suffix = String(value).replace(prefix, "").replace(/\d|,/g, "");

  useEffect(() => {
    if (isInView) {
      const c = animate(count, numeric, { duration: 2.2, ease: [0.16, 1, 0.3, 1] });
      return c.stop;
    }
  }, [isInView, numeric, count]);

  return (
    <span ref={ref}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

// Real campus stats scraped from itmgoi.in
const data = [
  { icon: MapPin, value: "10.85 ac", label: "Sprawling Campus", accent: "from-rose-500 to-[#800000]" },
  { icon: GraduationCap, value: "45", label: "Classrooms", accent: "from-amber-500 to-orange-600" },
  { icon: FlaskConical, value: "42", label: "Modern Labs", accent: "from-emerald-500 to-teal-700" },
  { icon: Cpu, value: "728", label: "Computers", accent: "from-indigo-500 to-violet-700" },
  { icon: Users, value: "2500", label: "NAAD Amphitheatre", accent: "from-sky-500 to-blue-700" },
  { icon: Briefcase, value: "80%+", label: "Placement Track", accent: "from-rose-500 to-pink-700" },
];

export default function Stats() {
  const pageKey = useLocation().pathname;
  return (
    <section data-section="stats" className="relative py-8 sm:py-20 md:py-28 bg-gradient-to-b from-[#fbf7f2] via-white to-white dark:from-[#0a0a14] dark:to-[#020617] overflow-hidden">

      {/* Decorative blurs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[300px] rounded-full bg-gradient-to-br from-rose-200/30 to-transparent blur-2xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
              <EditableText
                pageKey={pageKey}
                tkey="stats.eyebrow"
                as="span"
                value="Numbers don't lie"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]"
              >
                Numbers don&apos;t lie
              </EditableText>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
              <EditableText pageKey={pageKey} tkey="stats.title.line1" as="span" value="A campus built on">
                A campus built on
              </EditableText>{" "}
              <EditableText
                pageKey={pageKey}
                tkey="stats.title.line2"
                as="span"
                value="outcomes."
                className="bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent"
              >
                outcomes.
              </EditableText>
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-md">
            <EditableText
              pageKey={pageKey}
              tkey="stats.intro"
              as="span"
              multiline
              value="From day-one placement support to a worldwide alumni network — every number reflects a real student outcome, year after year."
            >
              From day-one placement support to a worldwide alumni network — every number reflects
              a real student outcome, year after year.
            </EditableText>
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {data.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-3xl border border-rose-50 dark:border-gray-800 shadow-sm hover:shadow-2xl transition-shadow p-3 sm:p-5"
            >
              {/* Glow */}
              <div
                className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${s.accent} opacity-10 group-hover:opacity-25 blur-2xl transition-opacity duration-500`}
              ></div>

              <div className="relative">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${s.accent} text-white flex items-center justify-center shadow-lg mb-2 sm:mb-4`}
                >
                  <s.icon size={16} />
                </div>

                <div className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.04em] text-[#1a0606] dark:text-white leading-none mb-2">
                  <Counter value={s.value} />
                </div>

                <div className="text-[9px] uppercase tracking-[0.18em] font-black text-gray-500 dark:text-gray-400 leading-tight">
                  {s.label}
                </div>

                <div className="mt-2 sm:mt-4 h-[2px] w-6 bg-gray-200 dark:bg-gray-700 group-hover:w-full bg-gradient-to-r from-[#800000] to-amber-400 transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
