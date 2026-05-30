/**
 * Per-kind section editors. Each receives:
 *   value:    current payload (draft if present, otherwise live)
 *   onChange: (newPayload) => void
 *   media:    { id -> {public_url, alt?} } cache for image previews (best-effort)
 */
import { useState } from 'react';
import { Plus, Trash2, ImagePlus, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import MediaPicker, { MediaThumb } from './MediaPicker';

const cls = {
  field: 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 focus:outline-none focus:border-[#800000]',
  label: 'block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-1',
  btn: 'text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5',
  btnPrimary: 'text-xs px-3 py-1.5 rounded-lg bg-[#800000] text-white hover:bg-[#600000] flex items-center gap-1.5',
};

function MediaField({ value, onChange, label = 'Image', media }) {
  const [open, setOpen] = useState(false);
  const current = value ? media?.[value] || { id: value, public_url: media?.[value]?.public_url } : null;
  return (
    <div>
      <span className={cls.label}>{label}</span>
      <div className="flex items-center gap-2">
        <MediaThumb media={current} />
        <button type="button" onClick={() => setOpen(true)} className={cls.btn}>
          <ImagePlus size={12} /> {value ? 'Change' : 'Pick / upload'}
        </button>
        {value ? (
          <button type="button" onClick={() => onChange(null)} className={cls.btn}>
            <Trash2 size={12} /> Clear
          </button>
        ) : null}
        {value ? <span className="text-[10px] text-gray-400">#{value}</span> : null}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(m) => onChange(m.id)}
      />
    </div>
  );
}

export function HeroEditor({ value = {}, onChange, media }) {
  const v = value || {};
  const set = (k, val) => onChange({ ...v, [k]: val });
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <label className="sm:col-span-2">
        <span className={cls.label}>Title</span>
        <input className={cls.field} value={v.title || ''} onChange={(e) => set('title', e.target.value)} />
      </label>
      <label>
        <span className={cls.label}>Subtitle</span>
        <input className={cls.field} value={v.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} />
      </label>
      <label>
        <span className={cls.label}>CTA label</span>
        <input className={cls.field} value={v.cta_label || ''} onChange={(e) => set('cta_label', e.target.value)} />
      </label>
      <label>
        <span className={cls.label}>CTA link</span>
        <input className={cls.field} value={v.cta_link || ''} onChange={(e) => set('cta_link', e.target.value)} />
      </label>
      <div className="sm:col-span-2">
        <MediaField label="Hero image" value={v.image_id} onChange={(id) => set('image_id', id)} media={media} />
      </div>
    </div>
  );
}

export function RichTextEditor({ value = {}, onChange }) {
  const v = typeof value === 'string' ? { md: value } : value || {};
  return (
    <label className="block">
      <span className={cls.label}>Markdown</span>
      <textarea
        rows={Math.max(6, (v.md || '').split('\n').length + 1)}
        value={v.md || ''}
        onChange={(e) => onChange({ ...v, md: e.target.value })}
        className={cls.field + ' font-mono text-[13px]'}
      />
    </label>
  );
}

export function ImageEditor({ value = {}, onChange, media }) {
  const v = value || {};
  return (
    <div className="space-y-3">
      <MediaField label="Image" value={v.image_id} onChange={(id) => onChange({ ...v, image_id: id })} media={media} />
      <label className="block">
        <span className={cls.label}>Alt text</span>
        <input className={cls.field} value={v.alt || ''} onChange={(e) => onChange({ ...v, alt: e.target.value })} />
      </label>
      <label className="block">
        <span className={cls.label}>Caption</span>
        <input className={cls.field} value={v.caption || ''} onChange={(e) => onChange({ ...v, caption: e.target.value })} />
      </label>
    </div>
  );
}

export function GalleryEditor({ value = [], onChange, media }) {
  const arr = Array.isArray(value) ? value : [];
  const [open, setOpen] = useState(false);
  const remove = (idx) => onChange(arr.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const next = [...arr];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={cls.label}>Gallery items ({arr.length})</span>
        <button type="button" onClick={() => setOpen(true)} className={cls.btnPrimary}>
          <Plus size={12} /> Add image
        </button>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {arr.map((it, i) => (
          <div key={i} className="relative group">
            <MediaThumb media={media?.[it.image_id] || { public_url: it.image_url }} size="h-24 w-full" />
            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-1 py-0.5 flex items-center justify-between opacity-0 group-hover:opacity-100">
              <button onClick={() => move(i, -1)}><ArrowUp size={10} /></button>
              <button onClick={() => move(i, +1)}><ArrowDown size={10} /></button>
              <button onClick={() => remove(i)}><Trash2 size={10} /></button>
            </div>
          </div>
        ))}
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(m) => onChange([...arr, { image_id: m.id, alt: m.alt }])}
      />
    </div>
  );
}

export function ListEditor({ value = [], onChange, media }) {
  const arr = Array.isArray(value) ? value : [];
  const update = (i, patch) => onChange(arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const remove = (i) => onChange(arr.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const next = [...arr];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const add = () => onChange([...arr, { title: '', body: '' }]);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className={cls.label}>Items ({arr.length})</span>
        <button type="button" onClick={add} className={cls.btnPrimary}>
          <Plus size={12} /> Add row
        </button>
      </div>
      <div className="space-y-2">
        {arr.map((it, i) => (
          <div key={i} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/40">
            <div className="flex items-center gap-2 mb-2">
              <GripVertical size={14} className="text-gray-400" />
              <input
                className={cls.field}
                placeholder="Title"
                value={it.title || ''}
                onChange={(e) => update(i, { title: e.target.value })}
              />
              <button onClick={() => move(i, -1)} className={cls.btn} title="Up"><ArrowUp size={12} /></button>
              <button onClick={() => move(i, +1)} className={cls.btn} title="Down"><ArrowDown size={12} /></button>
              <button onClick={() => remove(i)} className={cls.btn} title="Remove"><Trash2 size={12} /></button>
            </div>
            <textarea
              rows={2}
              className={cls.field + ' text-[13px]'}
              placeholder="Body / description (markdown ok)"
              value={it.body || ''}
              onChange={(e) => update(i, { body: e.target.value })}
            />
            <div className="mt-2">
              <MediaField
                label="Image (optional)"
                value={it.image_id}
                onChange={(id) => update(i, { image_id: id })}
                media={media}
              />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <input className={cls.field + ' text-xs'} placeholder="Link / URL (optional)" value={it.link || ''} onChange={(e) => update(i, { link: e.target.value })} />
              <input className={cls.field + ' text-xs'} placeholder="Subtitle (optional)" value={it.subtitle || ''} onChange={(e) => update(i, { subtitle: e.target.value })} />
            </div>
          </div>
        ))}
        {arr.length === 0 && <div className="text-center text-xs text-gray-400 py-4">No items yet. Click “Add row”.</div>}
      </div>
    </div>
  );
}

export function KvEditor({ value = {}, onChange }) {
  const v = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  const [newKey, setNewKey] = useState('');
  const update = (k, val) => onChange({ ...v, [k]: val });
  const remove = (k) => {
    const next = { ...v };
    delete next[k];
    onChange(next);
  };
  return (
    <div className="space-y-2">
      {Object.entries(v).map(([k, val]) => (
        <div key={k} className="flex items-start gap-2">
          <input className={cls.field + ' max-w-[180px] text-xs font-mono'} value={k} disabled />
          {typeof val === 'object' ? (
            <textarea
              className={cls.field + ' text-[13px] font-mono'}
              rows={2}
              value={JSON.stringify(val, null, 2)}
              onChange={(e) => {
                try { update(k, JSON.parse(e.target.value)); } catch { /* ignore until valid */ }
              }}
            />
          ) : (
            <input
              className={cls.field}
              value={val ?? ''}
              onChange={(e) => update(k, e.target.value)}
            />
          )}
          <button onClick={() => remove(k)} className={cls.btn}><Trash2 size={12} /></button>
        </div>
      ))}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <input
          className={cls.field + ' max-w-[180px] text-xs font-mono'}
          placeholder="new_key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <button
          type="button"
          className={cls.btnPrimary}
          onClick={() => { if (newKey && !(newKey in v)) { update(newKey, ''); setNewKey(''); } }}
        >
          <Plus size={12} /> Add key
        </button>
      </div>
    </div>
  );
}

export function JsonFallbackEditor({ value, onChange }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2));
  const [err, setErr] = useState('');
  return (
    <div>
      <span className={cls.label}>Raw JSON (no kind-specific editor yet)</span>
      <textarea
        className={cls.field + ' font-mono text-xs'}
        rows={10}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          try { onChange(JSON.parse(e.target.value)); setErr(''); }
          catch (er) { setErr(er.message); }
        }}
      />
      {err && <div className="mt-1 text-[11px] text-red-600">{err}</div>}
    </div>
  );
}

export default function SectionEditor({ kind, value, onChange, media }) {
  switch (kind) {
    case 'hero':       return <HeroEditor       value={value} onChange={onChange} media={media} />;
    case 'rich_text':  return <RichTextEditor   value={value} onChange={onChange} />;
    case 'image':      return <ImageEditor      value={value} onChange={onChange} media={media} />;
    case 'gallery':    return <GalleryEditor    value={value} onChange={onChange} media={media} />;
    case 'list':       return <ListEditor       value={value} onChange={onChange} media={media} />;
    case 'kv':         return <KvEditor         value={value} onChange={onChange} />;
    default:           return <JsonFallbackEditor value={value} onChange={onChange} />;
  }
}
