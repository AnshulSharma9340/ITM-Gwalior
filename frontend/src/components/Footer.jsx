import React from "react";
import { Link, useLocation } from "react-router-dom";
import EditableText from "./admin/EditableText";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaYoutube } from "react-icons/fa";
import { Mail, Phone, MapPin, ArrowUpRight, Send } from "lucide-react";

const logo = "/images/ITMGOILogo.png";

const SECTIONS = [
  {
    title: "About",
    links: [
      { label: "About Institute",    to: "/about" },
      { label: "Mission & Vision",   to: "/about/mission-vision" },
      { label: "Director's Message", to: "/about/director-message" },
      { label: "Board of Governors", to: "/about/board-of-governors" },
      { label: "Infrastructure",     to: "/about/infrastructure" },
      { label: "Best Practices",     to: "/about/best-practices" },
    ],
  },
  {
    title: "Admissions",
    links: [
      { label: "Overview",          to: "/admissions" },
      { label: "UG Courses",        to: "/admissions/ug" },
      { label: "PG Courses",        to: "/admissions/pg" },
      { label: "How to Apply",      to: "/admissions/how-to-apply" },
      { label: "Online Apply",      href: "http://itmgoi.in/OnlineApply_ITMGOI", external: true },
      { label: "Online Pay",        href: "https://onlineapply.itmgoi.in/form_hdfc.php?ok=Apply+Now", external: true },
    ],
  },
  {
    title: "Departments",
    links: [
      { label: "Computer Science",  to: "/cs" },
      { label: "Information Tech",  to: "/it" },
      { label: "Electronics & Comm.", to: "/ece" },
      { label: "Mechanical Eng.",   to: "/me" },
      { label: "Civil Engineering", to: "/ce" },
      { label: "MBA · Management",  to: "/mba" },
      { label: "Engg. Sci. & Hum.", to: "/esh" },
      { label: "Emerging Branches", to: "/emerging-branches" },
      { label: "Central Library",   to: "/library" },
    ],
  },
  {
    title: "Campus Life",
    links: [
      { label: "Training & Placement", to: "/tap" },
      { label: "Performing Arts Club", to: "/pac" },
      { label: "Other Clubs",          to: "/clubs" },
      { label: "UBA Cell",              to: "/cells/uba" },
      { label: "NSS Cell",              to: "/cells/nss" },
      { label: "Sports Cell",           to: "/cells/sports" },
      { label: "Women Empowerment",    to: "/cells/wec" },
    ],
  },
  {
    title: "Alumni & Research",
    links: [
      { label: "Alumni Portal",          href: "https://www.itmalumni.in/", external: true },
      { label: "Alumni Speaks",          to: "/alumni/speaks" },
      { label: "Mentorship",              to: "/alumni/mentorship" },
      { label: "Chapters",                to: "/alumni/chapters" },
      { label: "R&D Cell",                to: "/research/rd-cell" },
      { label: "International Journal",  href: "https://iijisem.com", external: true },
      { label: "FDP",                    to: "/research/fdp" },
      { label: "JRF",                    to: "/jrf" },
    ],
  },
  {
    title: "Compliance",
    links: [
      { label: "NAAC Policies",  to: "/naac" },
      { label: "IQAC",            to: "/iqac" },
      { label: "Committees",     to: "/committees" },
      { label: "NIRF Ranking",   to: "/nirf" },
      { label: "Anti-Ragging",   to: "/anti-ragging" },
      { label: "MOUs",            to: "/mous" },
      { label: "Appreciation",   to: "/appreciation" },
      { label: "Grievance Form", href: "https://forms.gle/VTEumajnux762Vtv8", external: true },
      { label: "Careers",        to: "/careers" },
      { label: "Gallery",         to: "/gallery" },
      { label: "Contact",         to: "/contact" },
    ],
  },
];

const SOCIALS = [
  { Icon: FaInstagram, url: "https://www.instagram.com/itm_gwalior/", label: "Instagram" },
  { Icon: FaLinkedinIn, url: "https://in.linkedin.com/school/itm-gwalior-cp/", label: "LinkedIn" },
  { Icon: FaFacebookF, url: "https://www.facebook.com/itmgoigwl/", label: "Facebook" },
  { Icon: FaTwitter, url: "https://x.com/itm_gwalior", label: "Twitter" },
  { Icon: FaYoutube, url: "#", label: "YouTube" },
];

export default function Footer() {
  const pageKey = useLocation().pathname;
  return (
    <footer data-section="footer" className="relative bg-[#0a0a14] text-white pt-8 sm:pt-20 pb-6 sm:pb-10 px-4 sm:px-6 overflow-hidden">

      {/* Decorative glows */}
      <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-[#800000]/20 blur-2xl rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto">

        {/* Newsletter strip */}
        <div className="mb-6 sm:mb-16 rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-6">
          <div>
            <h3 className="text-base sm:text-xl md:text-2xl font-black tracking-tight mb-0.5 sm:mb-1">
              <EditableText pageKey={pageKey} tkey="footer.news.title" as="span" value="Stay in the loop.">Stay in the loop.</EditableText>
            </h3>
            <p className="hidden sm:block text-sm text-gray-400 font-medium">
              <EditableText pageKey={pageKey} tkey="footer.news.sub" as="span" value="Admission dates, deadlines and ITM stories — straight to your inbox.">Admission dates, deadlines and ITM stories — straight to your inbox.</EditableText>
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full md:w-auto gap-2 bg-white/5 border border-white/10 rounded-full p-1 sm:p-1.5 backdrop-blur"
          >
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 md:w-72 bg-transparent px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium outline-none placeholder-gray-500"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-br from-[#800000] to-[#5a0000] text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded-full font-black text-[9px] sm:text-[10px] tracking-widest uppercase hover:scale-[1.02] transition-transform"
            >
              <Send size={10} className="sm:!w-3 sm:!h-3" /> Subscribe
            </button>
          </form>
        </div>

        {/* Top row — brand + contact strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 mb-6 sm:mb-12">

          {/* Brand */}
          <div className="lg:col-span-8 space-y-3 sm:space-y-6">
            <img src={logo} alt="ITM Logo" className="h-10 sm:h-14 w-auto brightness-200 drop-shadow-xl" />
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium max-w-sm">
              <span className="text-amber-300 font-black">Think Big. Think Beyond.</span> 30 years of
              shaping leaders, engineers and entrepreneurs in central India.
            </p>

            {/* Accreditation badges */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {["NAAC Grade A", "NBA", "AICTE", "RGPV"].map((b) => (
                <span
                  key={b}
                  className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-2 sm:px-3 py-1 sm:py-1.5 bg-white/5 border border-white/10 rounded-full text-amber-300"
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Socials */}
            <div className="flex gap-1.5 sm:gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 hover:bg-[#800000] flex items-center justify-center text-gray-400 hover:text-white transition-all border border-white/10 text-sm sm:text-base"
                >
                  <s.Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Contact column */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4">
            <h4 className="text-amber-300 font-black uppercase tracking-[0.25em] text-[10px]">Reach Us</h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
              <a href="tel:+917773005065" className="flex items-start gap-2 sm:gap-2.5 text-gray-300 hover:text-white">
                <Phone size={12} className="mt-0.5 sm:mt-1 sm:!w-3.5 sm:!h-3.5 text-amber-300 shrink-0" />
                <span className="text-[11px] sm:text-sm font-medium leading-snug sm:leading-relaxed">
                  <span className="block text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-500 mb-0.5">Admissions</span>
                  +91-77730 05065
                </span>
              </a>
              <a href="tel:+917512440056" className="flex items-start gap-2 sm:gap-2.5 text-gray-300 hover:text-white">
                <Phone size={12} className="mt-0.5 sm:mt-1 sm:!w-3.5 sm:!h-3.5 text-amber-300 shrink-0" />
                <span className="text-[11px] sm:text-sm font-medium leading-snug sm:leading-relaxed">
                  <span className="block text-[8px] sm:text-[9px] uppercase tracking-widest text-gray-500 mb-0.5">General</span>
                  +91-751-2440056
                </span>
              </a>
              <a href="mailto:admission@itmgoi.in" className="col-span-2 flex items-start gap-2 sm:gap-2.5 text-gray-300 hover:text-white">
                <Mail size={12} className="mt-0.5 sm:mt-1 sm:!w-3.5 sm:!h-3.5 text-amber-300 shrink-0" />
                <span className="text-[11px] sm:text-sm font-medium break-all">admission@itmgoi.in</span>
              </a>
              <div className="col-span-2 flex items-start gap-2 sm:gap-2.5 text-gray-300">
                <MapPin size={12} className="mt-0.5 sm:mt-1 sm:!w-3.5 sm:!h-3.5 text-amber-300 shrink-0" />
                <span className="text-[11px] sm:text-xs font-medium leading-snug sm:leading-relaxed">
                  ITM Campus, NH-75 Sithouli, Jhansi Road, Gwalior – 475001, M.P.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Link sections grid — 6 columns of pages */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-5 sm:gap-6 md:gap-8 mb-6 sm:mb-16 pb-6 sm:pb-12 border-b border-white/10">
          {SECTIONS.map((sec) => (
            <div key={sec.title}>
              <h4 className="text-amber-300 font-black uppercase tracking-[0.22em] text-[9px] sm:text-[10px] mb-2.5 sm:mb-5">
                {sec.title}
              </h4>
              <ul className="space-y-1.5 sm:space-y-2.5">
                {sec.links.map((l) =>
                  l.to ? (
                    <li key={l.label}>
                      <Link
                        to={l.to}
                        className="group inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-[11px] sm:text-[13px] font-medium transition-colors"
                      >
                        {l.label}
                        <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target={l.external ? "_blank" : undefined}
                        rel={l.external ? "noreferrer" : undefined}
                        className="group inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-[11px] sm:text-[13px] font-medium transition-colors"
                      >
                        {l.label}
                        {l.external && <ArrowUpRight size={10} className="opacity-50" />}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        {/* Google Map — free embed, no API key needed */}
        <div className="mb-6 sm:mb-12">
          <h4 className="text-amber-300 font-black uppercase tracking-[0.25em] text-[10px] mb-3 sm:mb-4 flex items-center gap-2">
            <MapPin size={12} /> Find Us on the Map
          </h4>
          <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-white/10">
            <iframe
              title="ITM Gwalior Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.5644837840134!2d78.188140625!3d26.1476125!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c12c5b0586e9%3A0x600c3b01859c7625!2sITM%20University%2C%20Gwalior!5e1!3m2!1sen!2sin!4v1716358261000!5m2!1sen!2sin"
              width="100%"
              className="h-44 sm:h-[300px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, display: "block", filter: "brightness(0.85) contrast(1.1) saturate(0.8)" }}
              allowFullScreen
            />
            <div className="bg-white/5 px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500 line-clamp-2 sm:line-clamp-none">
                45XQ+27R, Nh-75, opp. Sithouli Railway Station, Sithouli, Gwalior, Madhya Pradesh 474001
              </span>
              <a
                href="https://www.bing.com/maps/search?FORM=HDRSC6&style=h&q=ITM+Gwalior&ss=id.ypid%3A9E50EDE66558A167"
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1"
              >
                Open in Bing Maps <ArrowUpRight size={10} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-black text-gray-500 text-center">
            © 2026 ITM Gwalior · Independent Excellence
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-6 gap-y-1.5 sm:gap-y-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-500">
            <a href="#" className="hover:text-amber-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-amber-300 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-amber-300 transition-colors">Sitemap</a>
            <Link to="/anti-ragging" className="hover:text-amber-300 transition-colors">Anti-Ragging</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
