import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  FileText, Building2, GraduationCap, Users, CalendarDays,
  Images, ImageIcon, Briefcase, FlaskConical, Scale, Inbox,
  ChevronRight, ShieldOff, CheckCircle2,
} from 'lucide-react';

const ALL_SECTIONS = [
  {
    icon: FileText,     label: 'Pages & SEO',    desc: 'Edit page content, meta titles and descriptions.',
    to: '/admin/pages',           scopePrefix: 'pages',
  },
  {
    icon: Building2,    label: 'Departments',     desc: 'Update department info — HoD, faculty listing, labs.',
    to: '/admin/departments',     scopePrefix: 'dept',
  },
  {
    icon: GraduationCap,label: 'Faculty',         desc: 'Add or update faculty records by department.',
    to: '/admin/faculty',         scopePrefix: 'faculty',
  },
  {
    icon: Users,        label: 'Students',        desc: 'Register and manage student records.',
    to: '/admin/students',        scopePrefix: 'students',
  },
  {
    icon: CalendarDays, label: 'Events & Notices',desc: 'Post events, notices and ticker announcements.',
    to: '/admin/events',          scopePrefix: 'events',
  },
  {
    icon: Images,       label: 'Gallery',         desc: 'Upload and organise photo and video galleries.',
    to: '/admin/gallery',         scopePrefix: 'gallery',
  },
  {
    icon: ImageIcon,    label: 'Media Library',   desc: 'Upload images, PDFs and brochures.',
    to: '/admin/media',           scopePrefix: 'media',
  },
  {
    icon: Briefcase,    label: 'Placement Cell',  desc: 'Recruiters, services, testimonials and placement events.',
    to: '/admin/placements-cell', scopePrefix: 'placement',
  },
  {
    icon: FlaskConical, label: 'Research Suite',  desc: 'Publications, patents, conferences and FDPs.',
    to: '/admin/research',        scopePrefix: 'research',
  },
  {
    icon: Scale,        label: 'Compliance',      desc: 'NAAC, NIRF, committees and alumni records.',
    to: '/admin/compliance',      scopePrefix: 'compliance',
  },
  {
    icon: Inbox,        label: 'Leads & Inbox',   desc: 'View admission leads, contact and job applications.',
    to: '/admin/leads',           scopePrefix: 'leads',
  },
];

const ACCENT_COLORS = [
  'from-sky-500 to-blue-700',
  'from-emerald-500 to-teal-700',
  'from-[#800000] to-[#3e0202]',
  'from-indigo-500 to-indigo-700',
  'from-emerald-500 to-green-700',
  'from-pink-500 to-fuchsia-700',
  'from-fuchsia-500 to-purple-700',
  'from-orange-500 to-red-700',
  'from-cyan-500 to-blue-700',
  'from-teal-500 to-cyan-700',
  'from-yellow-500 to-orange-700',
];

function SectionCard({ icon: Icon, label, desc, to, colorClass }) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg p-5 transition-all hover:-translate-y-1 flex flex-col"
    >
      <div className={`absolute -top-5 -right-5 w-20 h-20 rounded-full opacity-10 bg-gradient-to-br ${colorClass}`} />
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${colorClass}`}>
        <Icon size={18} className="text-white" />
      </div>
      <h3 className="font-black text-sm text-gray-900 dark:text-white tracking-tight">{label}</h3>
      <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed flex-1">{desc}</p>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#800000] opacity-0 group-hover:opacity-100 transition-opacity">
        Open <ChevronRight size={12} />
      </div>
    </Link>
  );
}

function PermissionBadge({ scope }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg">
      <CheckCircle2 size={10} className="text-emerald-500 shrink-0" />
      {scope}
    </span>
  );
}

export default function EditorDashboard() {
  const { user, scopes } = useAuth();

  const hasAnyScope = (prefix) =>
    (scopes || []).some((s) => s === prefix || s.startsWith(prefix + '.'));

  const accessibleSections = ALL_SECTIONS.filter(({ scopePrefix }) =>
    hasAnyScope(scopePrefix)
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          Welcome{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-gray-500 font-medium mt-1">
          You have editor access. Below are the sections you can manage.
        </p>
      </div>

      {/* Accessible sections */}
      {accessibleSections.length > 0 ? (
        <section className="mb-10">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">
            Your Sections ({accessibleSections.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {accessibleSections.map((section, i) => (
              <SectionCard
                key={section.to}
                {...section}
                colorClass={ACCENT_COLORS[i % ACCENT_COLORS.length]}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="mb-10 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
          <ShieldOff size={32} className="text-amber-400 mx-auto mb-2" />
          <p className="font-black text-gray-800 dark:text-white">No sections assigned yet</p>
          <p className="text-sm text-gray-500 mt-1">Contact your administrator to get permissions assigned.</p>
        </div>
      )}

      {/* My permissions */}
      <section className="mb-10">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-3">
          My Permissions
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          {scopes && scopes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {scopes.map((s) => (
                <PermissionBadge key={s} scope={s} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No permissions assigned. Contact your admin.</p>
          )}
        </div>
      </section>

    </AdminLayout>
  );
}
