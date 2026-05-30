import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import slider1 from "../assets/slider1.jpg";
import slider2 from "../assets/slider2.jpg";
import { usePublicHome } from "../hooks/usePublicPage";
import Seo from "./Seo";

const FALLBACK_IMAGES = [slider1, slider2];

const FALLBACK_HERO = {
  headline: "Think Big. Think Beyond.",
  subhead:
    "At ITM Gwalior, we don't just follow the future — we architect it. " +
    "Empowering a new generation of leaders to transcend boundaries and redefine excellence.",
  primary_cta: { label: "Apply Now 2026", href: "/admissions/how-to-apply" },
  secondary_cta: { label: "Watch Tour", href: "#campus-tour" },
  slides: [],
  mini_stats: [
    { value: "29+", label: "Years" },
    { value: "1500+", label: "Recruiters" },
    { value: "98%", label: "Placement" },
  ],
};

function resolveImage(slide) {
  // Allow either a bundled asset (slider1) when no value, or a `/uploads/...` URL the CMS uploaded.
  if (!slide?.image) return null;
  return slide.image;
}

function splitHeadline(text) {
  // Highlight the last 2 words in a gradient — preserves the original visual.
  if (!text) return { first: "", emphasised: "" };
  const words = text.split(" ");
  if (words.length <= 2) return { first: "", emphasised: text };
  return {
    first: words.slice(0, Math.max(1, words.length - 2)).join(" "),
    emphasised: words.slice(-2).join(" "),
  };
}

export default function Hero() {
  const { data } = usePublicHome();
  const hero = data?.sections?.hero?.payload ?? FALLBACK_HERO;

  const slides = useMemo(() => {
    const fromApi = (hero.slides || []).map(resolveImage).filter(Boolean);
    return fromApi.length ? fromApi : FALLBACK_IMAGES;
  }, [hero.slides]);

  const { first, emphasised } = useMemo(() => splitHeadline(hero.headline), [hero.headline]);

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(
      () => setCurrentIndex((prev) => (prev + 1) % slides.length),
      5000
    );
    return () => clearInterval(timer);
  }, [slides.length]);

  const meta = data?.meta;
  return (
    <section data-section="hero" className="relative min-h-[88vh] sm:min-h-[100vh] flex items-start sm:items-center overflow-hidden bg-[#020617] pt-[140px] sm:pt-[150px] md:pt-[180px] pb-10 sm:pb-24">
      <Seo
        title={meta?.title || "ITM Gwalior — Engineering & Management Institute"}
        description={meta?.description || hero.subhead}
        image={meta?.og_image || slides[0]}
        canonical={meta?.canonical_url}
        robots={meta?.robots}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollegeOrUniversity",
          name: "ITM Gwalior",
          alternateName: "Institute of Technology and Management",
          url: typeof window !== "undefined" ? window.location.origin : "https://itmgoi.in",
          description: meta?.description || hero.subhead,
        }}
      />

      <div className="absolute inset-0 z-0 overflow-hidden bg-[#020617]">
        {slides.map((src, i) => (
          <img
            key={`${src}-${i}`}
            src={src}
            alt=""
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
              i === currentIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ filter: "saturate(1.05) contrast(1.02)", objectPosition: "center center" }}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent z-[1]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent z-[1]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">

        <div className="max-w-3xl text-white">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[88px] font-black leading-[0.95] sm:leading-[0.92] mb-5 sm:mb-6 tracking-tight sm:tracking-tighter"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.6)" }}
          >
            {first && <>{first} <br /></>}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
              {emphasised}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-sm sm:text-base md:text-lg text-gray-200 mb-7 sm:mb-9 max-w-xl leading-relaxed font-medium"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
          >
            {hero.subhead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4"
          >
            {hero.primary_cta && (
              <motion.a
                href={hero.primary_cta.href || "#"}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(220,38,38,0.6)" }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-r from-[#a30000] to-[#800000] text-white px-6 sm:px-9 py-3 sm:py-3.5 rounded-xl font-black text-[11px] tracking-widest uppercase shadow-xl shadow-[#800000]/40 cursor-pointer"
              >
                {hero.primary_cta.label}
              </motion.a>
            )}

            {hero.secondary_cta && (
              <motion.a
                href={hero.secondary_cta.href || "#"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group flex items-center gap-2 sm:gap-3 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-black text-[11px] tracking-widest uppercase border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white cursor-pointer hover:bg-white/10"
              >
                <span className="flex items-center justify-center w-7 h-7 bg-red-600 text-white rounded-full group-hover:rotate-[360deg] transition-transform duration-700">
                  <span className="ml-0.5 text-[9px]">▶</span>
                </span>
                {hero.secondary_cta.label}
              </motion.a>
            )}
          </motion.div>

          {hero.mini_stats?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-6 max-w-md"
            >
              {hero.mini_stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-300 to-amber-200 leading-none">
                    {s.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-gray-300 mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 left-4 sm:left-8 flex gap-2 sm:gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className="h-1 w-10 bg-white/20 rounded-full overflow-hidden cursor-pointer hover:h-1.5 transition-all"
            >
              {currentIndex === index && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="h-full bg-gradient-to-r from-red-400 to-amber-300"
                />
              )}
            </button>
          ))}
        </div>
      )}

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-6 right-8 hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold text-red-300/90 z-20"
      >
        Scroll
        <span className="inline-block w-px h-6 bg-red-300/80" />
      </motion.div>
    </section>
  );
}
