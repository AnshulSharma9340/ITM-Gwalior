import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, Search } from 'lucide-react';
import { mediaApi } from '../../api/cms';
import { errorMessage } from '../../api/client';

export function MediaThumb({ media, size = 'h-12 w-12' }) {
  if (!media?.public_url) {
    return (
      <div className={`${size} bg-gray-100 dark:bg-gray-800 rounded grid place-items-center text-gray-400`}>
        <ImageIcon size={18} />
      </div>
    );
  }
  return (
    <img
      src={media.public_url}
      alt={media.alt || ''}
      className={`${size} object-cover rounded border border-gray-200 dark:border-gray-700`}
    />
  );
}

export default function MediaPicker({ open, onClose, onPick, folder, accept = 'image/*' }) {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await mediaApi.list({ q, folder, kind: 'image' });
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const upload = async (file) => {
    if (!file) return;
    setLoading(true);
    setErr('');
    try {
      const created = await mediaApi.upload(file, { folder });
      onPick?.(created);
      onClose?.();
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-3xl bg-white dark:bg-gray-900 h-full overflow-y-auto p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon size={18} /> Pick or upload an image
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 flex items-center gap-2 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-900">
            <Search size={14} className="text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              placeholder="Search images…"
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            <button onClick={load} className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800">Go</button>
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="bg-[#800000] text-white text-xs font-black uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Upload size={14} /> Upload
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
        </div>

        {err && <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div>}
        {loading && <div className="text-center text-gray-400 text-sm py-6">Working…</div>}

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {items.map((m) => (
            <button
              key={m.id}
              onClick={() => { onPick?.(m); onClose?.(); }}
              className="group text-left"
              title={m.alt || m.original_name || ''}
            >
              <div className="aspect-square overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img src={m.public_url} alt={m.alt || ''} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="mt-1 text-[10px] text-gray-500 truncate">{m.alt || m.original_name || `#${m.id}`}</div>
            </button>
          ))}
        </div>
        {!loading && items.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">No images. Upload one above.</div>
        )}
      </div>
    </div>
  );
}
