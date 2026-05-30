/**
 * AdminPageEditor — the visual-ish CMS editor.
 *
 * Two screens in one component:
 *   1. List view (route /admin/pages)         — picks a page to edit
 *   2. Detail view (route /admin/pages/:key)  — edits all sections + meta with draft/publish
 *
 * Lives entirely against /api/admin/pages/* (the Phase 2 backend).
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, Search, Save, Eye, EyeOff, CheckCircle2,
  Rocket, AlertTriangle, RotateCcw, Plus, Trash2, Settings2, ExternalLink,
} from 'lucide-react';
import { adminPagesApi } from '../../api/adminPages';
import { errorMessage } from '../../api/client';
import SectionEditor from '../../components/admin/SectionEditors';
import MediaPicker, { MediaThumb } from '../../components/admin/MediaPicker';

const cls = {
  card: 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl',
  btn: 'text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5',
  btnPrimary: 'text-xs px-3 py-1.5 rounded-lg bg-[#800000] text-white hover:bg-[#600000] flex items-center gap-1.5',
  btnEm: 'text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5',
  btnDanger: 'text-xs px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-1.5',
  field: 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:outline-none focus:border-[#800000]',
  label: 'block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1',
};

// ─────────────────────── List view ─────────────────────────────────────

export function PagesList() {
  const [q, setQ] = useState('');
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['admin-pages-list', q],
    queryFn: () => adminPagesApi.list({ q: q || undefined }),
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={20} /> Pages
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Pick a page to edit its sections in the visual editor. Changes save as drafts; click <em>Publish</em> to go live.
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title or path…"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{errorMessage(error)}</div>}
        {isLoading && <div className="text-center text-gray-400 py-10">Loading pages…</div>}

        <div className="space-y-2">
          {data.map((p) => (
            <Link
              key={p.key}
              to={`/admin/pages/${encodeURIComponent(p.key)}/edit`}
              className={`${cls.card} px-4 py-3 flex items-center justify-between hover:border-[#800000] transition-colors`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{p.title}</span>
                  {p.has_draft && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      Draft · {p.draft_section_count} section{p.draft_section_count === 1 ? '' : 's'}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-gray-500 font-mono">
                  {p.path} · key={p.key}{p.scope_key ? ` · scope=${p.scope_key}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <span>{new Date(p.last_modified).toLocaleDateString()}</span>
                <span className={`px-1.5 py-0.5 rounded font-black uppercase ${p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                  {p.status}
                </span>
              </div>
            </Link>
          ))}
          {!isLoading && data.length === 0 && (
            <div className="text-center text-gray-400 py-10">No pages match. Run the seed script first.</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────── Detail view ───────────────────────────────────

function Toast({ kind = 'ok', text }) {
  if (!text) return null;
  const map = {
    ok: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    err: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
  };
  return (
    <div className={`text-xs px-3 py-2 rounded-lg border ${map[kind]}`}>{text}</div>
  );
}

function SectionCard({ section, pageKey, onPatched, media, mediaCache }) {
  const [value, setValue] = useState(section.payload_draft ?? section.payload ?? null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [err, setErr] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const ifMatch = section.draft_updated_at || '0';

  const save = async () => {
    setErr(''); setSaving(true);
    try {
      const updated = await adminPagesApi.patchSection(pageKey, section.section_key,
        { payload: value }, { ifMatch });
      setSavedAt(new Date());
      onPatched(updated);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const removeSection = async () => {
    if (!confirm(`Hide section "${section.section_key}"? It can be re-enabled later.`)) return;
    try {
      await adminPagesApi.deleteSection(pageKey, section.section_key);
      onPatched({ ...section, is_active: false });
    } catch (e) {
      setErr(errorMessage(e));
    }
  };

  return (
    <div className={`${cls.card} p-4`}>
      <div className="flex items-center justify-between mb-2 gap-2">
        <button onClick={() => setCollapsed((c) => !c)} className="text-left flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900 dark:text-white truncate">
              {section.label || section.section_key}
            </span>
            {section.has_draft && (
              <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">draft</span>
            )}
            {!section.is_active && (
              <span className="text-[10px] font-black uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">hidden</span>
            )}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            {section.section_key} · {section.kind} · pos {section.position}
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button onClick={save} disabled={saving} className={cls.btnPrimary} title="Save this section's draft">
            <Save size={12} /> {saving ? '…' : 'Save'}
          </button>
          <button onClick={removeSection} className={cls.btn} title="Hide section"><Trash2 size={12} /></button>
        </div>
      </div>
      {savedAt && <div className="mb-2"><Toast kind="ok" text={`Saved at ${savedAt.toLocaleTimeString()}`} /></div>}
      {err && <div className="mb-2"><Toast kind="err" text={err} /></div>}
      {!collapsed && (
        <div className="mt-3 border-t border-gray-100 dark:border-gray-800 pt-3">
          <SectionEditor kind={section.kind} value={value} onChange={setValue} media={mediaCache} />
        </div>
      )}
    </div>
  );
}

function MetaPanel({ page, onSaved }) {
  const [title, setTitle] = useState(page.title || '');
  const [introMd, setIntroMd] = useState(page.intro_md || '');
  const [heroId, setHeroId] = useState(page.hero_image?.id ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const seo = page.seo || {};
  const [seoDraft, setSeoDraft] = useState({
    meta_title: seo.meta_title || '',
    meta_description: seo.meta_description || '',
    canonical_url: seo.canonical_url || '',
    robots: seo.robots || 'index,follow',
  });
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingSeo, setSavingSeo] = useState(false);
  const [msg, setMsg] = useState({});

  const saveMeta = async () => {
    setSavingMeta(true); setMsg({});
    try {
      await adminPagesApi.patchMeta(page.key, { title, intro_md: introMd, hero_image_id: heroId });
      setMsg({ kind: 'ok', text: 'Meta saved as draft.' });
      onSaved();
    } catch (e) { setMsg({ kind: 'err', text: errorMessage(e) }); }
    finally { setSavingMeta(false); }
  };

  const saveSeo = async () => {
    setSavingSeo(true); setMsg({});
    try {
      await adminPagesApi.patchMeta(page.key, { seo_payload: seoDraft });
      setMsg({ kind: 'ok', text: 'SEO saved as draft.' });
      onSaved();
    } catch (e) { setMsg({ kind: 'err', text: errorMessage(e) }); }
    finally { setSavingSeo(false); }
  };

  return (
    <div className={`${cls.card} p-4 mb-4`}>
      <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2 mb-3">
        <Settings2 size={14} /> Page meta + SEO
      </h3>
      <div className="grid sm:grid-cols-2 gap-3">
        <label>
          <span className={cls.label}>Title</span>
          <input className={cls.field} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div>
          <span className={cls.label}>Hero image</span>
          <div className="flex items-center gap-2">
            <MediaThumb media={page.hero_image} />
            <button type="button" onClick={() => setPickerOpen(true)} className={cls.btn}>Pick / upload</button>
            {heroId && <button type="button" onClick={() => setHeroId(null)} className={cls.btn}>Clear</button>}
          </div>
        </div>
        <label className="sm:col-span-2">
          <span className={cls.label}>Intro (markdown)</span>
          <textarea rows={3} className={cls.field + ' font-mono text-[13px]'} value={introMd} onChange={(e) => setIntroMd(e.target.value)} />
        </label>
        <div className="sm:col-span-2 flex items-center gap-2">
          <button onClick={saveMeta} disabled={savingMeta} className={cls.btnPrimary}>
            <Save size={12} /> Save meta {savingMeta ? '…' : ''}
          </button>
        </div>
      </div>

      <h4 className="mt-5 mb-2 text-[11px] font-black uppercase tracking-widest text-gray-500">SEO</h4>
      <div className="grid sm:grid-cols-2 gap-3">
        <label>
          <span className={cls.label}>Meta title (≤70)</span>
          <input maxLength={70} className={cls.field} value={seoDraft.meta_title} onChange={(e) => setSeoDraft({ ...seoDraft, meta_title: e.target.value })} />
        </label>
        <label>
          <span className={cls.label}>Canonical URL</span>
          <input className={cls.field} value={seoDraft.canonical_url} onChange={(e) => setSeoDraft({ ...seoDraft, canonical_url: e.target.value })} />
        </label>
        <label className="sm:col-span-2">
          <span className={cls.label}>Meta description (≤255)</span>
          <textarea maxLength={255} rows={2} className={cls.field} value={seoDraft.meta_description} onChange={(e) => setSeoDraft({ ...seoDraft, meta_description: e.target.value })} />
        </label>
        <label>
          <span className={cls.label}>Robots</span>
          <input className={cls.field} value={seoDraft.robots} onChange={(e) => setSeoDraft({ ...seoDraft, robots: e.target.value })} />
        </label>
        <div className="flex items-end">
          <button onClick={saveSeo} disabled={savingSeo} className={cls.btnPrimary}>
            <Save size={12} /> Save SEO {savingSeo ? '…' : ''}
          </button>
        </div>
      </div>

      {msg.text && <div className="mt-3"><Toast kind={msg.kind} text={msg.text} /></div>}

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(m) => setHeroId(m.id)}
      />
    </div>
  );
}

export default function AdminPageEditor() {
  const { key } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [hideInactive, setHideInactive] = useState(true);
  const [busy, setBusy] = useState('');
  const [topMsg, setTopMsg] = useState({});

  const { data: page, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-page-edit', key],
    queryFn: () => adminPagesApi.edit(key),
    enabled: !!key,
  });

  // best-effort media cache for image previews — we collect ids we see
  const mediaCache = useMemo(() => {
    const m = {};
    if (page?.hero_image) m[page.hero_image.id] = page.hero_image;
    if (page?.seo?.og_image) m[page.seo.og_image.id] = page.seo.og_image;
    return m;
  }, [page]);

  if (!key) return <PagesList />;
  if (isLoading) return <div className="min-h-screen grid place-items-center text-gray-400">Loading page…</div>;
  if (error) return <div className="m-6"><Toast kind="err" text={errorMessage(error)} /></div>;
  if (!page) return null;

  const sections = (page.sections || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .filter((s) => !hideInactive || s.is_active);

  const replaceSection = (updated) => {
    qc.setQueryData(['admin-page-edit', key], (prev) => prev ? ({
      ...prev,
      sections: prev.sections.map((s) => s.section_key === updated.section_key ? { ...s, ...updated } : s),
      has_draft: true,
    }) : prev);
  };

  const publish = async () => {
    setBusy('publish'); setTopMsg({});
    try {
      const res = await adminPagesApi.publish(key);
      setTopMsg({ kind: 'ok', text: `Published ${res.sections_promoted} section(s)${res.meta_promoted ? ' + meta' : ''}.` });
      await refetch();
    } catch (e) {
      setTopMsg({ kind: 'err', text: errorMessage(e) });
    } finally { setBusy(''); }
  };

  const discard = async () => {
    if (!confirm('Discard all drafts on this page? This cannot be undone.')) return;
    setBusy('discard'); setTopMsg({});
    try {
      const res = await adminPagesApi.discard(key);
      setTopMsg({ kind: 'info', text: `Cleared ${res.sections_cleared} draft section(s).` });
      await refetch();
    } catch (e) { setTopMsg({ kind: 'err', text: errorMessage(e) }); }
    finally { setBusy(''); }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#020617] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/admin/pages')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-gray-900 dark:text-white truncate">{page.title}</h1>
              <div className="text-[11px] text-gray-500 font-mono truncate">
                {page.path} · key={page.key}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a href={page.path} target="_blank" rel="noreferrer" className={cls.btn}><ExternalLink size={12} /> Open live</a>
            <button onClick={() => setHideInactive((h) => !h)} className={cls.btn}>
              {hideInactive ? <Eye size={12} /> : <EyeOff size={12} />} {hideInactive ? 'Show hidden' : 'Hide hidden'}
            </button>
            {page.has_draft ? (
              <>
                <button onClick={discard} disabled={!!busy} className={cls.btn}>
                  <RotateCcw size={12} /> Discard
                </button>
                <button onClick={publish} disabled={!!busy} className={cls.btnEm}>
                  <Rocket size={12} /> {busy === 'publish' ? 'Publishing…' : 'Publish'}
                </button>
              </>
            ) : (
              <span className="text-[11px] text-gray-500 flex items-center gap-1.5"><CheckCircle2 size={12} className="text-emerald-600" /> No pending drafts</span>
            )}
          </div>
        </div>

        {topMsg.text && <div className="mb-3"><Toast kind={topMsg.kind} text={topMsg.text} /></div>}
        {page.has_draft && (
          <div className="mb-3"><Toast kind="info" text="This page has unpublished draft changes. Save individual sections, then click Publish at the top." /></div>
        )}

        <MetaPanel page={page} onSaved={refetch} />

        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500 mt-6 mb-3">Sections</h2>
        <div className="space-y-3">
          {sections.map((s) => (
            <SectionCard
              key={s.id}
              section={s}
              pageKey={page.key}
              onPatched={replaceSection}
              mediaCache={mediaCache}
            />
          ))}
          {sections.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm">
              No active sections on this page. Run <code>python -m scripts.seed_pages_from_frontend</code> on the backend to populate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
