import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import EditableText from '../components/admin/EditableText';

// ─── Shared Sub-Components ────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-1 bg-[#800000] rounded-full"></div>
      <h2 className="text-2xl font-black text-[#0b2a4a] dark:text-white">{children}</h2>
    </div>
  );
}

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PACPage() {
  const pageKey = useLocation().pathname;
  const [activeTab, setActiveTab] = useState('Performing Arts Club');
  const [dynamicEvents, setDynamicEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/pac/all");
        if (response.ok) {
          const data = await response.json();
          setDynamicEvents(data);
        }
      } catch (err) {
        console.error("Error fetching PAC events:", err);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event and its photos?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/pac/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setDynamicEvents(prev => prev.filter(event => event.id !== id));
          // Show success message or toast
        } else {
          alert("Failed to delete event.");
        }
      } catch (err) {
        console.error("Error deleting PAC event:", err);
      }
    }
  };

  const menuItems = [
    'Performing Arts Club',
    'PAC Team',
    'Events organized by the club',
    'Workshops Conducted'
  ];

  // Static "Permanent" Events as requested
  const staticEvents = [
    {
      title: "MAHARATHI",
      date: "13 April 2023",
      director: "Mr. Sanjay Singh Jadon",
      writer: "Mr. Vibhanshu Vaibhav",
      description: [
        "Mahabharata written by Mr. Vibhanshu Vaibhav. Mr. Vibhanshu Vaibhav is a well-known playwright and his rendition of Karna’s story in “Maharathi” has been widely appreciated in Indian theatre circles.",
        "In ITM, the first play titled 'Maharathi' was based on the life of Karna, and was staged at the NAAD amphitheater on April 13th, 2023. Karna, a central character in the Indian epic Mahabharata, was born to Kunti, the mother of the Pandavas, but was abandoned and raised by a charioteer. Despite his exceptional skills as a warrior and noble qualities, Karna faced discrimination due to his low birth. Throughout his life, he grappled with his identity and loyalty, ultimately meeting his fate on the battlefield of Kurukshetra. The play explores the complexities of Karna's character, his struggles, and his eventual destiny.",
        "In this, Harsh Pratap Singh played the role of Karna, Mohan portrayed Arjuna, Mitali depicted Draupadi, Anvesh portrayed Duryodhana, Dushyant played Krishna, Suyash played King Drupad as the main characters, while 19 others played pivoted roles and contributed to the success."
      ],
      images: [
        "/images/Maharathi_1.jpg",
        "/images/Maharathi_2.jpg",
        "/images/Maharathi_3.jpg",
        "/images/Maharathi_4.jpg"
      ]
    },
    {
      title: "PARSHURAM GATHA",
      date: "29 April 2023",
      director: "Mr. Sanjay Singh Jadon",
      writer: "Mr. Anirudh Tiwari (Virat)",
      description: [
        "\"Parshuram Gatha\" is a well-known play in Indian culture that depicts the legendary tale of Parshuram, a revered figure in Hindu mythology. Parshuram is known as the sixth avatar of Lord Vishnu and is celebrated for his strength, valor, and devotion to his duties.",
        "In The artists from Gwalior presented the play 'Parshuram Gatha' at IITTM college, with the involvement of three students from ITM college: Krishna portrayed the characters of Sahastrabahu Arjun's son and Sudama, Anuj depicted Sahastrabahu Arjun's son, and Pranjal enacted the role of Vishwa, the son of Jamadagni, and Laxman."
      ],
      images: [
        "/images/Parshuram_1.jpg",
        "/images/Parshuram_2.jpg",
        "/images/Parshuram_4.jpg",
        "/images/Parshuram_3.jpg"
      ]
    },
    {
      title: "EK KHAMOSH CHEEKH",
      date: "19 May 2023",
      director: "Mr. Gulshan Waliya Sir",
      assistantDirector: "Mr. Jay Solace",
      writer: "Mr. Gulshan Waliya Sir",
      description: [
        "“Ek Khamosh Cheekh” is a play that depicts injustice against girls in society. Although nowadays there has been considerable improvement, even today in rural areas far from the city, incidents like these are heard of, which inspired the writing of this play. This play entirely showcases the oppression faced by girls in society.",
        "This play was prepared during a 15-day workshop and was showcased on May 19th at the LDB Theatre Block of ITM University by the children of the ITM Performing Arts Club. The children from the club participated enthusiastically in the production. Along with this, MD Sir awarded the entire team a prize of Rs. 50,000 and additionally contributed Rs. 5 lakhs to the club fund.",
        "In this, Krishna Goyal played the role of Daya, Sejal portrayed Savitri, Mohan depicted Rokelal, and Tanish portrayed Durgesh as the main characters, while 13 others played pivoted roles and contributed to the success."
      ],
      images: [
        "/images/Khamosh_1.jpg",
        "/images/Khamosh_2.jpg",
        "/images/Khamosh_4.jpg",
        "/images/Khamosh_3.jpg"
      ]
    }
  ];

  // Reusable Event Component for clean UI
  const EventItem = ({ event, isDynamic = false, onDelete }) => {
    // Format dynamic date if it's a timestamp
    const displayDate = isDynamic 
      ? new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : event.date;

    const eventImages = isDynamic 
      ? event.images.map(img => `http://localhost:8000${img.image_url}`)
      : event.images;

    return (
      <div className="border-b border-gray-100 dark:border-gray-800 pb-8 sm:pb-12 last:border-0 last:pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg sm:text-2xl font-black text-[#800000] dark:text-red-400 tracking-tighter uppercase leading-none">
              {event.title}
            </h3>
            {/* {isDynamic && (
              <button 
                // onClick={() => onDelete(event.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all active:scale-90"
                title="Delete Event"
              >
                <Trash2 size={18} />
              </button>
            )} */}
          </div>
          <span className="inline-block px-4 py-1.5 bg-gray-100 dark:bg-red-900/20 text-[#800000] dark:text-red-300 rounded-full text-xs font-black tracking-widest">
            {displayDate}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-black uppercase tracking-widest text-[#0b2a4a] dark:text-white mb-4">
            {event.director && <span>Directed by: <span className="text-[#800000]">{event.director}</span></span>}
            {event.writer && <span>Written by: <span className="text-[#800000]">{event.writer}</span></span>}
            {event.assistantDirector && <span>Asst. Director: <span className="text-[#800000]">{event.assistantDirector}</span></span>}
          </div>

          <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium">
            {(() => {
              // Support: array (static), newline-separated string (new backend), or ".,"-separated (legacy backend)
              let paragraphs;
              if (Array.isArray(event.description)) {
                paragraphs = event.description;
              } else {
                // Try splitting by newlines first
                const byNewline = event.description
                  .split(/\n+/)
                  .map(p => p.trim())
                  .filter(p => p.length > 0);

                if (byNewline.length > 1) {
                  paragraphs = byNewline;
                } else {
                  // Fall back: split on "., " or ".," (legacy comma-joined format)
                  paragraphs = event.description
                    .split(/\.,\s*/)
                    .map(p => p.trim())
                    .filter(p => p.length > 0);
                }
              }

              return paragraphs.map((p, i) => (
                <p key={i} className={i > 0 ? 'mt-3' : ''}>{p}</p>
              ));
            })()}
          </div>


          {/* Photo Gallery - Adjusted to 2 images per line as requested, with no cropping */}
          <div className="mt-4 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 items-start">
            {eventImages.map((src, idx) => (
              <div key={idx} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gray-100/50 dark:bg-gray-800/30 ring-1 ring-gray-200/50 dark:ring-gray-700/50">
                <img
                  src={src}
                  className="w-full h-auto object-contain max-h-[400px] sm:max-h-[600px] mx-auto group-hover:scale-[1.02] transition-transform duration-500"
                  alt={`${event.title} - Gallary ${idx + 1}`}
                  onError={(e) => { e.target.src = "/images/upload.png"; }} 
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] transition-colors duration-500">

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <div data-section="pac_hero" className="relative bg-gradient-to-br from-[#3e0202] via-[#800000] to-[#5a0000] pt-8 pb-12 sm:pt-16 sm:pb-24 overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-8 right-32 w-72 h-72 rounded-full border-2 border-white"></div>
          <div className="absolute -bottom-20 -left-10 w-96 h-96 rounded-full border border-white/50"></div>
          <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-white/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <span className="inline-block text-red-200 font-bold tracking-widest text-xs uppercase mb-3 px-3 py-1 bg-white/10 rounded-full border border-white/20">
            <EditableText pageKey={pageKey} tkey="pac.eyebrow" as="span" value="Student Life & Activities">Student Life & Activities</EditableText>
          </span>
          <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 leading-tight">
            <EditableText pageKey={pageKey} tkey="pac.title.line1" as="span" value="Performing Arts">Performing Arts</EditableText> <br />
            <EditableText pageKey={pageKey} tkey="pac.title.line2" as="span" value="Club" className="text-white">Club</EditableText>
          </h1>
          <p className="text-red-100/80 max-w-xl text-sm leading-relaxed font-medium">
            <EditableText pageKey={pageKey} tkey="pac.intro" as="span" multiline
              value="Discover your artistic potential, participate in vibrant cultural events, and express yourself through music, dance, and drama.">
              Discover your artistic potential, participate in vibrant cultural events, and express yourself through music, dance, and drama.
            </EditableText>
          </p>

          {/* Quick-stat chips */}
          <div className="mt-4 sm:mt-8 flex flex-wrap gap-2 sm:gap-3">
            {[['🎭', 'Music & Dance'], ['🎬', 'Drama'], ['🎨', 'Creative Arts'], ['🌟', 'Cultural Events']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 text-white px-4 py-2 rounded-full text-xs font-bold">
                <span>{icon}</span> {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 pb-16 md:pb-24">

        {/* ── MOBILE TAB BAR ───────────────────────────────────── */}
        <div className="lg:hidden bg-gray-50 dark:bg-[#020617] py-3 -mx-3 px-3 sm:-mx-6 sm:px-6">
          <div className="flex overflow-x-auto gap-2 pb-1 snap-x" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
            {menuItems.map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                  activeTab === item
                    ? 'bg-[#800000] text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8 items-start mt-6 lg:mt-0">

          {/* ── SIDEBAR (DESKTOP) ────────────────────────────────── */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32">
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-[#800000] via-red-500 to-[#800000]"></div>
                <div className="p-5">
                  <h3 className="font-black text-xs uppercase tracking-widest mb-4 text-[#800000]">PAC MENU</h3>
                  <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => (
                      <button
                        key={item}
                        onClick={() => setActiveTab(item)}
                        className={`text-left py-2.5 px-5 transition-all duration-200 ${
                          activeTab === item
                            ? 'bg-[#800000] text-white shadow-md shadow-red-900/30 rounded-full'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-[#800000] dark:hover:text-red-400 rounded-full'
                        }`}
                      >
                        <span className="font-bold text-xs">{item}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </Card>
            </div>
          </aside>

          {/* ── TAB CONTENT ──────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* ══ PAC ABOUT ════════════════════════════════════ */}
                {activeTab === 'Performing Arts Club' && (
                  <div className="space-y-8">
                    <Card className="p-4 sm:p-8">
                      <SectionHeading>Performing Arts Club (PAC) </SectionHeading>
                      <div className="prose max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed font-medium space-y-6">
                        <p>
                          The Institute of Technology and Management introduced a value-added course under the Indian Knowledge System to nurture student's social and cultural sensibility. This course has been running effectively under the Performing Arts Club. In this value-added course students are provided training in theatre, music, dance, fine arts and literary.
                        </p>
                        
                        <div>
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-2">Historical Background:</h3>
                          <p>
                            The ITM Performing Arts Club at the ITM Institute of Technology and Management has been active for many years, dedicated to the holistic development of students. Recognizing the need for a course that would further enhance students' social sensitivity and equip them with various skills, the Director of the Institute decided to take action. Consequently, an instructor was appointed on January 1, 2023, to train students in disciplines such as theater, dance, music, fine arts, and literary education, with a focus on social awareness. This value-added course began with a cohort of 25-26 students and, over two years, has successfully organized numerous cultural and social programs. At present is still nurturing new talents.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-2">Mission and Objectives:</h3>
                          <p>
                            The objective of the Value Edit course is to awaken an emotional aspect towards art, literature, and society in the students so that when the students come to render their services in the society after completing their education, they can fully express themselves and their emotions. And to present the intellectual aspect in a positive form is the aim of our institute, keeping this in mind we decided to run this value-added course under the auspices of ITM Performance Club.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-2">Membership and Participation:</h3>
                          <p>
                            The membership of the club has been steadily increasing, with new and active members joining every semester. Every semester, we organize various programs and competitions in which club members participate and showcase their art.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-2">Activities and Events:</h3>
                          <p>
                            The ITM Performing Arts Club has organized numerous successful events, including theater performances, music concerts, dance recitals, art exhibitions, and various other art-related programs. Each year, the club members organize various significant and inspirational theater production that also addresses social issues.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-2">Impact and Recognition:</h3>
                          <p>
                            Our programs have had a significant impact on institute and our society, and the work of our club is commendable. We have received several awards and accolades, and our club has been featured in the media on numerous occasions.
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-2">Future Plans:</h3>
                          <p>
                            Our club aims to grow and diversify further. We plan to organize new programs, workshops, and arts festivals to provide even more opportunities for young talents to develop their skills and realize their dreams.<br />
                            Thus, the ITM Performing Arts Club is a thriving and progressive organization that is capable of promoting arts and literature in society and providing young talents with opportunities to fulfill their aspirations.
                          </p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-3">Programme Outcome (POs):</h3>
                          <ul className="list-none space-y-3 pl-0">
                            <li><strong className="text-gray-900 dark:text-white">PO1. Enhanced Emotional Intelligence:</strong> Graduates will demonstrate a heightened ability to understand and manage their own emotions, as well as effectively empathize with others, contributing to stronger relationships and a more emotionally aware community.</li>
                            <li><strong className="text-gray-900 dark:text-white">PO2. Mastery of Public Speaking and Confidence:</strong> Participants will develop superior public speaking skills and exude confidence, enabling them to communicate persuasively and assertively in any setting.</li>
                            <li><strong className="text-gray-900 dark:text-white">PO3. Creative Problem-Solving:</strong> Students will cultivate innovative thinking and creative problem-solving abilities, applying these skills to overcome challenges in diverse professional and personal scenarios.</li>
                            <li><strong className="text-gray-900 dark:text-white">PO4. Resilience and Adaptability:</strong> Graduates will exhibit resilience and adaptability, showing a readiness to face and overcome unexpected challenges with grace and composure.</li>
                            <li><strong className="text-gray-900 dark:text-white">PO5. Cultural Literacy and Inclusivity:</strong> Participants will gain a deep understanding of diverse cultures and perspectives, promoting inclusivity and fostering a global mindset in their interactions and contributions to society.</li>
                            <li><strong className="text-gray-900 dark:text-white">PO6. Leadership and Teamwork:</strong> The program will produce leaders who can effectively collaborate within teams, showing strong leadership abilities while also valuing and fostering teamwork.</li>
                            <li><strong className="text-gray-900 dark:text-white">PO7. Self-Discipline and Time Management:</strong> Students will develop strong self-discipline and time management skills, enabling them to balance multiple responsibilities and excel in both academic and professional endeavors.</li>
                            <li><strong className="text-gray-900 dark:text-white">PO8. Broad Intellectual Curiosity and Worldview:</strong> Graduates will possess a broadened intellectual curiosity and a well-rounded worldview, applying this knowledge to contribute meaningfully to their chosen fields and communities.</li>
                          </ul>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                          <h3 className="text-[#800000] dark:text-red-400 font-bold text-base mb-3">Course Outcome (COs):</h3>
                          <ul className="list-none space-y-3 pl-0">
                            <li><strong className="text-gray-900 dark:text-white">CO1. Enhance Emotional Intelligence:</strong> Provide immersive cultural and theatrical experiences to develop emotional awareness and empathy.</li>
                            <li><strong className="text-gray-900 dark:text-white">CO2. Foster Creativity:</strong> Encourage creative expression through diverse cultural and theatrical activities.</li>
                            <li><strong className="text-gray-900 dark:text-white">CO3. Build Leadership Skills:</strong> Develop leadership abilities through hands-on participation and collaboration.</li>
                            <li><strong className="text-gray-900 dark:text-white">CO4. Promote Global Awareness:</strong> Increase understanding of global cultures and perspectives.</li>
                            <li><strong className="text-gray-900 dark:text-white">CO5. Equip with Life Skills:</strong> Impart essential skills for personal and professional success.</li>
                          </ul>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30 mt-6 shadow-sm">
                          <h3 className="text-[#800000] dark:text-red-400 font-black text-base mb-2">Mission of Performing Arts Club (PAC)</h3>
                          <p className="italic text-gray-800 dark:text-red-200">
                            These outcomes align with the program's mission to nurture holistic character development, preparing participants to succeed in various aspects of life while making a positive impact on the world around them.
                          </p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* ══ PAC TEAM ═════════════════════════════════════ */}
                {activeTab === 'PAC Team' && (
                  <div className="space-y-8">
                    <Card className="p-4 sm:p-8">
                      <SectionHeading>PAC Team</SectionHeading>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                        <div className="bg-gray-50 dark:bg-white/[0.02] p-3 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-lg transition-all cursor-pointer">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden border-2 border-white dark:border-gray-600 shadow-md">
                            <img src="/images/upload.png" alt="Coordinator" className="w-full h-full object-cover" />
                          </div>
                          <h3 className="font-bold text-[#0b2a4a] dark:text-white mb-1">Dr. Preeti Singh</h3>
                          <p className="text-xs font-medium text-[#800000]">Coordinator</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-white/[0.02] p-3 sm:p-5 rounded-3xl border border-gray-100 dark:border-gray-800 text-center hover:shadow-lg transition-all cursor-pointer">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 mb-4 overflow-hidden border-2 border-white dark:border-gray-600 shadow-md">
                            <img src="/images/Sanjay Singh jadon.png" alt="Co-Coordinator" className="w-full h-full object-cover" />
                          </div>
                          <h3 className="font-bold text-[#0b2a4a] dark:text-white mb-1">Mr. Sanjay Singh Jadon</h3>
                          <p className="text-xs font-medium text-[#800000]">Co-Coordinator</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

                {/* ══ EVENTS ══════════════════════════════════════ */}
                {activeTab === 'Events organized by the club' && (
                  <div className="space-y-8">
                    <Card className="p-4 sm:p-8">
                      <SectionHeading>Events organized</SectionHeading>
                      <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {/* Static Permanent Events */}
                        {staticEvents.map((event, idx) => (
                          <EventItem key={`static-${idx}`} event={event} />
                        ))}

                        {/* Dynamic Backend Events */}
                        {dynamicEvents.map((event, idx) => (
                          <EventItem key={`dynamic-${idx}`} event={event} isDynamic={true} onDelete={handleDelete} />
                        ))}

                        {staticEvents.length === 0 && dynamicEvents.length === 0 && (
                          <p className="text-center text-gray-500 py-12 font-medium">No events found.</p>
                        )}
                      </div>
                    </Card>
                  </div>
                )}

                {/* ══ WORKSHOPS ════════════════════════════════════ */}
                {activeTab === 'Workshops Conducted' && (
                  <div className="space-y-8">
                    <Card className="p-4 sm:p-8">
                      <SectionHeading>Workshops Conducted</SectionHeading>
                      <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                          {[
                            { title: 'Acting 101', date: 'August 2025', desc: 'Introduction to method acting and stage presence.' },
                            { title: 'Vocal Techniques', date: 'September 2025', desc: 'Breathing exercises and vocal range expansion.' },
                            { title: 'Choreography Masterclass', date: 'October 2025', desc: 'Creating dynamic group dance routines.' },
                            { title: 'Scriptwriting Boot Camp', date: 'November 2025', desc: 'From short skits to full length dramas.' }
                          ].map((workshop, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-white/[0.02] p-3 sm:p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                              <span className="text-xs font-bold text-[#800000] mb-2 inline-block bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">{workshop.date}</span>
                              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{workshop.title}</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{workshop.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
