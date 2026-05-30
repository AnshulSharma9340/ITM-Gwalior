import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Pencil, Check, X, ChevronDown, Search, RotateCcw, LayoutDashboard, Layers,
  Loader2, CloudOff, CloudUpload, CloudCheck,
} from 'lucide-react';
import { useEditMode } from '../../context/EditModeContext';
import { SITE_PAGES, pageLabelForPath } from '../../data/sitePages';

/*
 * Floating control, admin-only, shown on every public page. Lets the admin:
 *   • toggle live edit mode (the pencil),
 *   • jump to any other page to edit (the page switcher),
 *   • see save status (debounced backend PUTs),
 *   • reset the current page's overrides (clears the row on the backend).
 */

function SaveStatusPill({ status }) {
  if (!status || status === 'idle') return null;
  const map = {
    saving: { Icon: Loader2, text: 'Saving…', cls: 'bg-slate-800/90 text-white', spin: true },
    saved:  { Icon: CloudCheck, text: 'Saved', cls: 'bg-emerald-700/95 text-white' },
    error:  { Icon: CloudOff, text: 'Save failed', cls: 'bg-rose-700/95 text-white' },
  };
  const m = map[status];
  if (!m) return null;
  const { Icon } = m;
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${m.cls} text-[10px] font-black uppercase tracking-widest shadow-lg`}>
      <Icon size={11} className={m.spin ? 'animate-spin' : ''} />
      {m.text}
    </div>
  );
}

export default function AdminEditBar() {
  const { enabled, editMode, toggleEditMode, resetPage, hasOverrides, saveStatus } = useEditMode();
  const location = useLocation();
  const navigate = useNavigate();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [prevPath, setPrevPath] = useState(location.pathname);
  const panelRef = useRef(null);

  const pageKey = location.pathname;

  // Collapse the switcher when the route changes (e.g. nav from the header).
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setSwitcherOpen(false);
    setQuery('');
  }

  // Close the switcher on outside click.
  useEffect(() => {
    if (!switcherOpen) return;
    const onClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setSwitcherOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [switcherOpen]);

  // Never render for non-admins.
  if (!enabled) return null;

  const q = query.trim().toLowerCase();
  const groups = SITE_PAGES.map((g) => ({
    ...g,
    pages: g.pages.filter(
      (p) => !q || p.label.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
    ),
  })).filter((g) => g.pages.length > 0);

  const go = (path) => {
    setSwitcherOpen(false);
    if (path !== location.pathname) navigate(path);
  };

  return (
    <div data-no-edit="1" className="fixed bottom-5 left-5 z-[130] flex flex-col items-start gap-2">
      {/* Page switcher panel */}
      {switcherOpen && (
        <div
          ref={panelRef}
          className="w-72 max-h-[60vh] overflow-hidden flex flex-col rounded-2xl bg-white dark:bg-[#0a0e1a] border border-gray-200 dark:border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-white/10">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Switch to page…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-800 dark:text-white placeholder:text-gray-400"
            />
          </div>
          <div className="overflow-y-auto py-1">
            {groups.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-gray-400">No pages match.</div>
            )}
            {groups.map((g) => (
              <div key={g.group} className="py-1">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {g.group}
                </div>
                {g.pages.map((p) => {
                  const active = p.path === location.pathname;
                  return (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => go(p.path)}
                      className={`w-full text-left px-3 py-1.5 text-[13px] flex items-center justify-between gap-2 transition-colors ${
                        active
                          ? 'bg-[#800000]/10 text-[#800000] dark:text-rose-300 font-bold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="truncate">{p.label}</span>
                      <span className="text-[10px] text-gray-400 font-mono truncate max-w-[90px]">
                        {p.path}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control cluster */}
      <div className="flex items-center gap-2">
        {/* Pencil toggle */}
        <button
          type="button"
          onClick={toggleEditMode}
          title={editMode ? 'Exit edit mode' : 'Edit this page'}
          className={`flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-2xl ring-2 transition-all active:scale-95 ${
            editMode
              ? 'bg-emerald-600 text-white ring-emerald-300/50 hover:bg-emerald-700'
              : 'bg-gradient-to-br from-[#a30000] to-[#800000] text-white ring-amber-300/40 hover:brightness-110'
          }`}
        >
          {editMode ? <Check size={16} strokeWidth={2.6} /> : <Pencil size={16} strokeWidth={2.4} />}
          <span className="text-[11px] font-black uppercase tracking-widest">
            {editMode ? 'Done' : 'Edit'}
          </span>
        </button>

        {/* Page switcher */}
        <button
          type="button"
          onClick={() => setSwitcherOpen((v) => !v)}
          title="Switch page"
          className="flex items-center gap-2 px-3 py-2.5 rounded-full bg-slate-900/95 dark:bg-white/10 backdrop-blur-xl text-white ring-1 ring-white/10 shadow-2xl hover:bg-slate-800 transition-colors"
        >
          <Layers size={15} />
          <span className="text-[11px] font-bold tracking-wide max-w-[120px] truncate hidden sm:inline">
            {pageLabelForPath(location.pathname)}
          </span>
          <ChevronDown size={13} className={`transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* In edit mode: reset + dashboard shortcuts */}
        {editMode && (
          <>
            {hasOverrides(pageKey) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all local layout changes on this page?')) resetPage(pageKey);
                }}
                title="Reset this page's changes"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white/10 text-gray-600 dark:text-white ring-1 ring-gray-200 dark:ring-white/10 shadow-xl hover:text-[#800000] transition-colors"
              >
                <RotateCcw size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={() => navigate('/admin')}
              title="Open admin dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-white/10 text-gray-600 dark:text-white ring-1 ring-gray-200 dark:ring-white/10 shadow-xl hover:text-[#800000] transition-colors"
            >
              <LayoutDashboard size={15} />
            </button>
          </>
        )}
      </div>

      {/* Edit-mode banner + save status */}
      {editMode && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-600/95 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
            <Pencil size={11} /> Editing — click any text, image, or list
            <button type="button" onClick={toggleEditMode} className="ml-1 hover:opacity-80" title="Exit">
              <X size={12} />
            </button>
          </div>
          <SaveStatusPill status={saveStatus} />
        </div>
      )}
    </div>
  );
}
