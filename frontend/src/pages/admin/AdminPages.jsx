import { useMemo, useRef, useState } from 'react';
import {
  FileText, Search, Monitor, Tablet, Smartphone, ExternalLink,
  RotateCcw, RefreshCw, Pencil, ChevronRight, Info,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useEditMode } from '../../context/EditModeContext';
import { SITE_PAGES, pageLabelForPath } from '../../data/sitePages';

const DEVICES = {
  desktop: { label: 'Desktop', icon: Monitor, width: '100%', max: 'none' },
  tablet: { label: 'Tablet', icon: Tablet, width: '820px', max: '820px' },
  mobile: { label: 'Mobile', icon: Smartphone, width: '390px', max: '390px' },
};

/*
 * Pages & SEO — edit every public page from inside the dashboard.
 *
 * The left rail lists all pages; selecting one loads it in an embedded preview
 * (an iframe of the live route). The app detects it's framed and turns on edit
 * mode automatically, so text becomes click-to-edit, images get a Replace
 * button, and layout blocks can be reordered/hidden — without leaving this page.
 * All edits save locally and reflect on the live site immediately.
 */
export default function AdminPages() {
  const { resetPage, hasOverrides } = useEditMode();
  const [selected, setSelected] = useState('/');
  const [query, setQuery] = useState('');
  const [device, setDevice] = useState('desktop');
  const [nonce, setNonce] = useState(0); // bump to force-reload the iframe
  const iframeRef = useRef(null);

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      SITE_PAGES.map((g) => ({
        ...g,
        pages: g.pages.filter(
          (p) => !q || p.label.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
        ),
      })).filter((g) => g.pages.length > 0),
    [q]
  );

  const dev = DEVICES[device];

  const reload = () => setNonce((n) => n + 1);
  const handleReset = () => {
    if (window.confirm(`Reset all local edits on "${pageLabelForPath(selected)}"?`)) {
      resetPage(selected);
      reload();
    }
  };

  return (
    <AdminLayout>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <FileText size={20} /> Pages &amp; SEO
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Pick a page and edit its text, images and layout right here — changes save automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
        {/* ── Page list ── */}
        <aside className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col max-h-[78vh]">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a page…"
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
                  const active = p.path === selected;
                  const edited = hasOverrides(p.path);
                  return (
                    <button
                      key={p.path}
                      type="button"
                      onClick={() => setSelected(p.path)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors ${
                        active
                          ? 'bg-[#800000]/10 text-[#800000] dark:text-rose-300 font-bold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
                      }`}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block text-[13px] truncate">{p.label}</span>
                        <span className="block text-[10px] text-gray-400 font-mono truncate">{p.path}</span>
                      </span>
                      {edited && (
                        <span
                          title="Has unsaved local edits"
                          className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500"
                        />
                      )}
                      {active && <ChevronRight size={14} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Preview editor ── */}
        <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden flex flex-col min-h-[78vh]">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <span className="flex items-center gap-2 mr-auto min-w-0">
              <Pencil size={14} className="text-[#800000] shrink-0" />
              <span className="font-black text-sm text-gray-900 dark:text-white truncate">
                {pageLabelForPath(selected)}
              </span>
              <span className="text-[11px] text-gray-400 font-mono truncate hidden sm:inline">{selected}</span>
            </span>

            {/* Device width toggle */}
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
              {Object.entries(DEVICES).map(([key, d]) => {
                const Icon = d.icon;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setDevice(key)}
                    title={d.label}
                    className={`p-1.5 rounded-md transition-colors ${
                      device === key
                        ? 'bg-white dark:bg-gray-700 text-[#800000] shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Icon size={15} />
                  </button>
                );
              })}
            </div>

            {hasOverrides(selected) && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset this page's edits"
                className="p-1.5 rounded-md text-gray-400 hover:text-[#800000] transition-colors"
              >
                <RotateCcw size={15} />
              </button>
            )}
            <button
              type="button"
              onClick={reload}
              title="Reload preview"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 transition-colors"
            >
              <RefreshCw size={15} />
            </button>
            <a
              href={selected}
              target="_blank"
              rel="noreferrer"
              title="Open live page in new tab"
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ExternalLink size={15} />
            </a>
          </div>

          {/* Hint */}
          <div className="flex items-center gap-2 px-3 py-2 bg-sky-50 dark:bg-sky-500/10 text-sky-800 dark:text-sky-300 text-[11px] font-medium border-b border-sky-100 dark:border-sky-500/20">
            <Info size={13} className="shrink-0" />
            Click any text to edit it, use the violet “Replace” button on images, and the maroon
            controls to reorder or hide sections. Edits save automatically.
          </div>

          {/* Preview frame */}
          <div className="flex-1 overflow-auto bg-gray-100 dark:bg-[#020617] p-3 flex justify-center">
            <iframe
              key={`${selected}-${nonce}`}
              ref={iframeRef}
              src={selected}
              title={`Preview — ${pageLabelForPath(selected)}`}
              className="bg-white rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all"
              style={{ width: dev.width, maxWidth: dev.max, height: '100%', minHeight: '70vh' }}
            />
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
