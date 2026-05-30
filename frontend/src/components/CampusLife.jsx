import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import EditableText from "./admin/EditableText";

const campusHighlights = [
  { 
    title: "Techno-Cultural Fest", 
    subtitle: "KRONOS", // Reverted
    size: "md:col-span-2 md:row-span-2", 
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop",
  },
  { 
    title: "Central Library", 
    subtitle: "Knowledge Hub", // Reverted
    size: "md:col-span-1 md:row-span-1", 
    image: "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=2030&auto=format&fit=crop",
  },
  { 
    title: "Sports Arena", 
    subtitle: "Champions", // Reverted
    size: "md:col-span-1 md:row-span-2", 
    image: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=2069&auto=format&fit=crop",
  },
  { 
    title: "Innovation Lab", 
    subtitle: "R&D", // Reverted
    size: "md:col-span-1 md:row-span-1", 
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop",
  },
  { 
    title: "Student Cafeteria", 
    subtitle: "Eat & Chill", // Reverted
    size: "md:col-span-2 md:row-span-1", 
    image: "https://images.unsplash.com/photo-1567521464027-f127ff144326?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function CampusLife() {
  const pageKey = useLocation().pathname;
  return (
    <section data-section="campus_life" className="py-10 sm:py-24 bg-white dark:bg-[#020617] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header Section */}
        <div className="mb-6 sm:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[#800000] dark:text-red-400 font-black uppercase tracking-[0.4em] text-[10px]"
          >
            <EditableText pageKey={pageKey} tkey="campuslife.eyebrow" as="span" value="Lifestyle">Lifestyle</EditableText>
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-4xl md:text-6xl font-black text-[#3e0202] dark:text-white mt-3 sm:mt-4 tracking-tighter"
          >
            <EditableText pageKey={pageKey} tkey="campuslife.title.line1" as="span" value="Experience Life at">Experience Life at</EditableText> <br />
            <EditableText pageKey={pageKey} tkey="campuslife.title.line2" as="span" value="ITM Gwalior."
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#800000] to-red-600">ITM Gwalior.</EditableText>
          </motion.h2>
        </div>

        {/* --- THE BENTO GRID --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:min-h-[700px]">
          {campusHighlights.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -10 }}
              className={`${item.size} relative group rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl h-40 sm:h-80 md:h-full border border-gray-100 dark:border-white/10`}
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-8 sm:left-8 sm:right-8 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                {/* SUBTITLE: Reverted Text with Gold Color */}
                <p className="text-[#FFD700] text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-1 drop-shadow-2xl">
                  {item.subtitle}
                </p>
                
                {/* TITLE */}
                <h3 className="text-white text-base sm:text-2xl md:text-3xl font-black tracking-tight drop-shadow-2xl">
                  {item.title}
                </h3>
                
                {/* Action Line */}
                <motion.div 
                  className="w-0 h-[2px] bg-[#FFD700] mt-3 group-hover:w-12 transition-all duration-500" 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
