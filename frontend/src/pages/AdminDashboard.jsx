import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { aiAgentAPI } from '../api/ai-agent';
import {
  GraduationCap, Users, Calendar, Image, Music,
  LogOut, ChevronRight, LayoutDashboard, Plus, ShieldCheck,
  Settings as SettingsIcon, FileText, ImageIcon, Building2, Briefcase, FlaskConical, CalendarDays, Images, Inbox, Scale,
  Bot, RefreshCw, Loader2, CheckCircle2, AlertCircle
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link to={to} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md p-6 flex items-center gap-4 transition-all hover:-translate-y-0.5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value ?? '—'}</p>
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mt-0.5">{label}</p>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-[#800000] group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

function ActionCard({ icon: Icon, label, desc, to, accent }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg p-6 transition-all hover:-translate-y-1 block"
    >
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 ${accent}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
        <Icon size={20} className="text-white" />
      </div>
      <h3 className="font-black text-base text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
        {label}
        <Plus size={14} className="text-gray-300 group-hover:text-[#800000] transition-colors" />
      </h3>
      <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">{desc}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [reindexStatus, setReindexStatus] = useState('idle'); // idle | confirming | indexing | done | error
  const [reindexResult, setReindexResult] = useState(null);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get('/api/faculty/', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/students/', { headers }).catch(() => ({ data: [] })),
      axios.get('/api/events/all').catch(() => ({ data: { upcoming: [], past: [] } })),
      axios.get('/api/pac/all').catch(() => ({ data: [] })),
      axios.get('/api/placements/all').catch(() => ({ data: [] })),
    ]).then(([fac, stu, ev, pac, pl]) => {
      setStats({
        faculty: fac.data.length,
        students: stu.data.length,
        events: (ev.data.upcoming?.length ?? 0) + (ev.data.past?.length ?? 0),
        pac: pac.data.length,
        placements: pl.data.length,
      });
    });
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617]">

      {/* Top bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#800000] to-[#3e0202] flex items-center justify-center">
              <LayoutDashboard size={14} className="text-white" />
            </div>
            <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight">ITM Admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#800000] transition-colors"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage all content for the ITM Gwalior website.</p>
        </div>

        {/* Stats grid */}
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard icon={GraduationCap} label="Faculty Members"  value={stats.faculty}     color="bg-gradient-to-br from-[#800000] to-[#3e0202]" to="/admin/faculty" />
            <StatCard icon={Users}         label="Students"          value={stats.students}    color="bg-gradient-to-br from-indigo-500 to-indigo-700"  to="/admin/students" />
            <StatCard icon={Calendar}      label="TAP Events"        value={stats.events}      color="bg-gradient-to-br from-emerald-500 to-teal-700"    to="/admin/tap" />
            <StatCard icon={Music}         label="PAC Events"        value={stats.pac}         color="bg-gradient-to-br from-amber-500 to-orange-600"    to="/admin/pac" />
            <StatCard icon={Image}         label="Placement Logos"   value={stats.placements}  color="bg-gradient-to-br from-rose-500 to-pink-700"       to="/admin/placements" />
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Manage Sections</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard icon={GraduationCap} label="Faculty"       desc="Add, view and remove faculty members by department."     to="/admin/faculty"     accent="bg-gradient-to-br from-[#800000] to-[#3e0202]" />
            <ActionCard icon={Users}         label="Students"      desc="Register students, filter by year and department."       to="/admin/students"    accent="bg-gradient-to-br from-indigo-500 to-indigo-700" />
            <ActionCard icon={Calendar}      label="TAP Events"    desc="Post upcoming campus drives, internships and talks."     to="/admin/tap"         accent="bg-gradient-to-br from-emerald-500 to-teal-700" />
            <ActionCard icon={Music}         label="PAC Events"    desc="Upload cultural event highlights with gallery images."   to="/admin/pac"         accent="bg-gradient-to-br from-amber-500 to-orange-600" />
            <ActionCard icon={Image}         label="Placements"    desc="Upload recruiter logos shown on the placements page."   to="/admin/placements"  accent="bg-gradient-to-br from-rose-500 to-pink-700" />
            <ActionCard icon={ShieldCheck}   label="Users & Scopes" desc="Create scoped editors (CS dept, placement cell, etc.)." to="/admin/users"      accent="bg-gradient-to-br from-violet-500 to-fuchsia-700" />
            <ActionCard icon={FileText}      label="Pages & SEO"   desc="Edit page sections + meta title/description/OG image."  to="/admin/pages"      accent="bg-gradient-to-br from-sky-500 to-blue-700" />
            <ActionCard icon={SettingsIcon}  label="Site Settings"  desc="Logo, brand color, contact, social, default SEO."        to="/admin/settings"   accent="bg-gradient-to-br from-slate-500 to-slate-700" />
            <ActionCard icon={ImageIcon}     label="Media Library"  desc="Upload & manage images, PDFs and brochures."             to="/admin/media"      accent="bg-gradient-to-br from-fuchsia-500 to-purple-700" />
            <ActionCard icon={Building2}     label="Departments"    desc="CS / ECE / IT / CE / ME / MBA / ESH — HoD, faculty, labs." to="/admin/departments" accent="bg-gradient-to-br from-emerald-500 to-teal-700" />
            <ActionCard icon={Briefcase}     label="Placement Cell" desc="Recruiters, TAP team, services, MoUs, testimonials, events." to="/admin/placements-cell" accent="bg-gradient-to-br from-orange-500 to-red-700" />
            <ActionCard icon={FlaskConical}  label="Research Suite" desc="Focus areas, publications, books, patents, journal, conferences, FDPs." to="/admin/research" accent="bg-gradient-to-br from-cyan-500 to-blue-700" />
            <ActionCard icon={CalendarDays}  label="Events & Notices" desc="Events, clubs/cells, notices, ticker announcements."          to="/admin/events"  accent="bg-gradient-to-br from-emerald-500 to-green-700" />
            <ActionCard icon={Images}        label="Gallery"         desc="Categories + multi-image upload + captions + videos."         to="/admin/gallery" accent="bg-gradient-to-br from-pink-500 to-fuchsia-700" />
            <ActionCard icon={Inbox}         label="Leads & Inbox"   desc="Admission leads, contact, grievance, job applications."        to="/admin/leads"   accent="bg-gradient-to-br from-yellow-500 to-orange-700" />
            <ActionCard icon={Scale}         label="Compliance · Alumni · About" desc="NAAC, NIRF, committees, board, officials, alumni." to="/admin/compliance" accent="bg-gradient-to-br from-teal-500 to-cyan-700" />
          </div>
        </div>

        {/* AI Agent section */}
        <div>
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">AI Chatbot</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg p-6 transition-all hover:-translate-y-1 block">
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-gradient-to-br from-purple-500 to-violet-700" />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br from-purple-500 to-violet-700">
                <Bot size={20} className="text-white" />
              </div>
              <h3 className="font-black text-base text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                Re-index Website Content
              </h3>
              <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed mb-4">
                Crawl the ITM websites and re-populate the AI chatbot's knowledge base with the latest content.
              </p>

              {reindexStatus === 'idle' && (
                <button
                  onClick={() => setReindexStatus('confirming')}
                  className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw size={13} /> Start Re-index
                </button>
              )}

              {reindexStatus === 'confirming' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">This will take a minute. Proceed?</span>
                  <button
                    onClick={async () => {
                      setReindexStatus('indexing');
                      setReindexResult(null);
                      try {
                        // First clear existing content, then re-crawl all websites
                        await aiAgentAPI.reindex();
                        const result = await aiAgentAPI.indexAll();
                        setReindexResult(result);
                        setReindexStatus('done');
                      } catch (err) {
                        setReindexResult({ error: err.message });
                        setReindexStatus('error');
                      }
                    }}
                    className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    Yes, start
                  </button>
                  <button
                    onClick={() => setReindexStatus('idle')}
                    className="text-xs px-3 py-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {reindexStatus === 'indexing' && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-xs font-semibold">Indexing websites…</span>
                </div>
              )}

              {reindexStatus === 'done' && reindexResult && (
                <div>
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Done</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5">
                    <p><span className="font-semibold">{reindexResult.total_chunks_indexed}</span> chunks indexed</p>
                    <p><span className="font-semibold">{reindexResult.websites_indexed}</span> websites crawled</p>
                    {reindexResult.status === 'partial' && (
                      <p className="text-amber-600 mt-1">Some websites had errors. Check logs.</p>
                    )}
                  </div>
                  <button
                    onClick={() => { setReindexStatus('idle'); setReindexResult(null); }}
                    className="mt-3 text-[11px] text-gray-400 hover:text-gray-600 font-medium underline underline-offset-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {reindexStatus === 'error' && reindexResult && (
                <div>
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Error</span>
                  </div>
                  <p className="text-xs text-red-600">{reindexResult.error || 'Something went wrong.'}</p>
                  <button
                    onClick={() => { setReindexStatus('idle'); setReindexResult(null); }}
                    className="mt-2 text-[11px] text-gray-400 hover:text-gray-600 font-medium underline underline-offset-2"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
