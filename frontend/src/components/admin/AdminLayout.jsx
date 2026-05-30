import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, GraduationCap, Users, FileText, Settings,
  ImageIcon, Building2, Briefcase, FlaskConical, CalendarDays,
  Images, Inbox, Scale, LogOut, Menu, X, ShieldCheck, ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',           icon: LayoutDashboard, adminTo: '/admin',               editorTo: '/editor' },
  { label: 'Pages & SEO',         icon: FileText,         adminTo: '/admin/pages',          scopePrefix: 'pages' },
  { label: 'Users & Permissions', icon: ShieldCheck,      adminTo: '/admin/users',          adminOnly: true },
  { label: 'Departments',         icon: Building2,        adminTo: '/admin/departments',    scopePrefix: 'dept' },
  { label: 'Faculty',             icon: GraduationCap,    adminTo: '/admin/faculty',        scopePrefix: 'faculty' },
  { label: 'Students',            icon: Users,            adminTo: '/admin/students',       scopePrefix: 'students' },
  { label: 'Events & Notices',    icon: CalendarDays,     adminTo: '/admin/events',         scopePrefix: 'events' },
  { label: 'Gallery',             icon: Images,           adminTo: '/admin/gallery',        scopePrefix: 'gallery' },
  { label: 'Media Library',       icon: ImageIcon,        adminTo: '/admin/media',          scopePrefix: 'media' },
  { label: 'Placement Cell',      icon: Briefcase,        adminTo: '/admin/placements-cell',scopePrefix: 'placement' },
  { label: 'Research',            icon: FlaskConical,     adminTo: '/admin/research',       scopePrefix: 'research' },
  { label: 'Compliance',          icon: Scale,            adminTo: '/admin/compliance',     scopePrefix: 'compliance' },
  { label: 'Leads & Inbox',       icon: Inbox,            adminTo: '/admin/leads',          scopePrefix: 'leads' },
  { label: 'Settings',            icon: Settings,         adminTo: '/admin/settings',       adminOnly: true },
];

export default function AdminLayout({ children }) {
  const { user, role, isAdmin, isSuperAdmin, isEditor, scopes, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const hasAnyScope = (prefix) => {
    if (isAdmin) return true;
    return (scopes || []).some((s) => s === prefix || s.startsWith(prefix + '.'));
  };

  const visibleItems = NAV_ITEMS.filter(({ adminOnly, scopePrefix, editorTo }) => {
    if (adminOnly) return isAdmin;
    if (isAdmin) return true;
    if (isEditor) {
      if (!scopePrefix && editorTo) return true; // Dashboard always visible
      if (scopePrefix) return hasAnyScope(scopePrefix);
    }
    return false;
  }).map((item) => ({
    ...item,
    to: isEditor && item.editorTo ? item.editorTo : item.adminTo,
  }));

  const roleBadgeClass =
    isSuperAdmin ? 'bg-rose-100 text-[#800000]' :
    isAdmin      ? 'bg-orange-100 text-orange-800' :
                   'bg-amber-100 text-amber-800';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] flex">

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo row */}
        <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#800000] to-[#3e0202] flex items-center justify-center">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="font-black text-sm text-gray-900 dark:text-white tracking-tight flex-1">ITM Admin</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <p className="text-sm font-black text-gray-900 dark:text-white truncate">
            {user?.full_name || user?.username || 'Admin'}
          </p>
          {user?.email && (
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
          )}
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mt-1.5 inline-block ${roleBadgeClass}`}>
            {role?.replace('_', ' ')}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {visibleItems.map(({ label, to, icon: Icon }) => {
            const active = location.pathname === to || (to !== '/admin' && to !== '/editor' && location.pathname.startsWith(to));
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#800000]/10 text-[#800000] dark:bg-[#800000]/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={16} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-gray-500 hover:text-[#800000] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all"
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3 sticky top-0 z-10 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={18} />
          </button>
          <span className="font-black text-sm text-gray-900 dark:text-white">ITM Admin</span>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
