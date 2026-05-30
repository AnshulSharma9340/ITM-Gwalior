import React from "react";
import { useLocation } from "react-router-dom";
import Reveal from "./Reveal";
import PlacementData from "./PlacementData";
import EditableText from "./admin/EditableText";

export default function Placements() {
  const pageKey = useLocation().pathname;
  return (
    <section data-section="placements" className="relative py-6 sm:py-20 md:py-28 bg-gradient-to-b from-white via-rose-50/30 to-white dark:from-[#020617] dark:to-[#020617] overflow-hidden">
      <div className="absolute top-20 left-0 w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-rose-200/40 to-transparent blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 sm:gap-6 mb-6 sm:mb-12">
          <div className="max-w-xl">
            <Reveal>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-1 bg-gradient-to-r from-[#800000] to-amber-500 rounded-full"></div>
                <EditableText pageKey={pageKey} tkey="placements.eyebrow" as="span" value="Career Outcomes"
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-[#800000]">
                  Career Outcomes
                </EditableText>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-[-0.03em] text-[#1a0606] dark:text-white leading-[1.05]">
                <EditableText pageKey={pageKey} tkey="placements.title.line1" as="span" value="Our Alumni">Our Alumni</EditableText>{" "}
                <span className="relative inline-block">
                  <EditableText pageKey={pageKey} tkey="placements.title.line2" as="span" value="Network."
                    className="relative z-10 bg-gradient-to-br from-[#800000] to-[#3e0202] bg-clip-text text-transparent">
                    Network.
                  </EditableText>
                  <span className="absolute inset-x-0 bottom-1 h-3 bg-amber-200/60 -z-0 -skew-x-3"></span>
                </span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-md">
              <EditableText pageKey={pageKey} tkey="placements.intro" as="span" multiline
                value="Real students. Real packages. Real companies. Browse the latest placement records from the ITM Gwalior batch of 2025.">
                Real students. Real packages. Real companies. Browse the latest placement records
                from the ITM Gwalior batch of 2025.
              </EditableText>
            </p>
          </Reveal>
        </div>

        {/* Data */}
        <Reveal delay={0.3}>
          <PlacementData />
        </Reveal>
      </div>
    </section>
  );
}
