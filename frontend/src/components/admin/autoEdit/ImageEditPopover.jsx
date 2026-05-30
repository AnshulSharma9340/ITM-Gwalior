/* Floating popover for editing an image's src in place.
 *
 * Triggered by the AutoEditWalker when an admin clicks an editable <img> or a
 * background-image element. Renders as a fixed-position card so it floats
 * above the page regardless of scroll. The walker provides:
 *
 *   - tkey: stable key under which the new src will be saved
 *   - currentSrc: existing override (or null)
 *   - mode: "img" | "bg"
 *   - anchor: DOMRect of the source element (used to position the card)
 *   - onSave(newSrc): commit handler
 *   - onClose(): dismiss
 */
import { useEffect, useRef, useState } from 'react';
import { Pencil, Link2, Upload, X, RotateCcw, EyeOff } from 'lucide-react';

const MAX_INLINE_BYTES = 1.8 * 1024 * 1024; // keep data URLs reasonable

export default function ImageEditPopover({
  tkey,
  currentSrc,
  mode = 'img',
  anchor,
  onSave,
  onClose,
}) {
  const fileRef = useRef(null);
  const cardRef = useRef(null);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  // Position the card near the source element without spilling off-screen.
  const style = positionFor(anchor);

  // Click-outside / Escape dismiss
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    const onDown = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [onClose]);

  const commitUrl = () => {
    const v = url.trim();
    if (!v) return;
    onSave(v);
  };

  const onFile = (file) => {
    setErr('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('Please choose an image file.');
      return;
    }
    if (file.size > MAX_INLINE_BYTES) {
      setErr('Image is larger than 1.8 MB. Paste a URL instead, or use the Media library.');
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = () => {
      setBusy(false);
      onSave(reader.result);
    };
    reader.onerror = () => {
      setBusy(false);
      setErr('Could not read file.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      data-no-edit="1"
      ref={cardRef}
      style={style}
      className="fixed z-[200] w-80 max-w-[92vw] rounded-2xl bg-white dark:bg-[#0a0e1a] border border-[#800000]/40 shadow-2xl text-gray-900 dark:text-white"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-600 to-[#800000] flex items-center justify-center text-white">
            <Pencil size={13} />
          </span>
          <div className="leading-tight">
            <div className="text-[12px] font-black text-gray-900 dark:text-white">
              Edit {mode === 'bg' ? 'background' : 'image'}
            </div>
            <div className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">{tkey}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-white"
          title="Close"
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Current preview */}
        {currentSrc ? (
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 rounded-lg p-1.5">
            <img
              src={currentSrc}
              alt=""
              className="w-12 h-12 object-cover rounded-md border border-gray-200 dark:border-white/10"
            />
            <span className="text-[10px] font-mono text-gray-500 truncate flex-1">{shortSrc(currentSrc)}</span>
          </div>
        ) : null}

        {/* URL */}
        <div className="flex items-center gap-1.5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5">
          <Link2 size={13} className="text-gray-400 shrink-0" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitUrl()}
            placeholder="Paste image URL…"
            className="flex-1 bg-transparent text-xs outline-none text-gray-800 dark:text-white placeholder-gray-400"
          />
          <button
            type="button"
            disabled={!url.trim()}
            onClick={commitUrl}
            className="text-[10px] font-black uppercase px-2 py-1 rounded bg-[#800000] text-white disabled:opacity-40"
          >
            Set
          </button>
        </div>

        {/* Upload */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 hover:border-[#800000] hover:text-[#800000] transition-colors disabled:opacity-60"
        >
          <Upload size={13} /> {busy ? 'Reading…' : 'Upload from device'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />

        {/* Divider before destructive actions */}
        <div className="border-t border-gray-100 dark:border-white/10 my-1" />

        {/* Restore original (clear the override) — only useful when one exists */}
        {currentSrc ? (
          <button
            type="button"
            onClick={() => onSave(null)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            title="Remove the override and show the page's default"
          >
            <RotateCcw size={13} /> Restore original {mode === 'bg' ? 'background' : 'image'}
          </button>
        ) : null}

        {/* Delete — hides the image entirely (mode=img) or removes the bg (mode=bg) */}
        <button
          type="button"
          onClick={() => {
            const what = mode === 'bg' ? 'background' : 'image';
            if (window.confirm(`Delete this ${what} from the page?`)) {
              onSave(mode === 'bg' ? '' : '__hide__');
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-colors shadow-sm"
          title={mode === 'bg' ? 'Remove background image' : 'Hide this image — it will not render at all'}
        >
          <EyeOff size={13} /> Delete {mode === 'bg' ? 'background' : 'image'}
        </button>

        {err ? <div className="text-[11px] text-red-600 font-semibold">{err}</div> : null}
      </div>
    </div>
  );
}

function shortSrc(s) {
  if (!s) return '';
  if (s.startsWith('data:')) return `data:${s.length} chars`;
  return s.length > 60 ? s.slice(0, 60) + '…' : s;
}

// Anchor the popover near the element it's editing, within viewport bounds.
function positionFor(rect) {
  if (!rect) return { left: 24, top: 24 };
  const W = window.innerWidth;
  const H = window.innerHeight;
  const pw = 320; // card width
  const ph = 240; // approx card height
  let left = rect.left + Math.max(0, rect.width / 2 - pw / 2);
  let top = rect.bottom + 8;
  // If we'd spill off the right edge, align to right
  if (left + pw > W - 16) left = Math.max(16, W - pw - 16);
  // If we'd spill off the bottom, flip above
  if (top + ph > H - 16) top = Math.max(16, rect.top - ph - 8);
  // Final clamp
  if (left < 16) left = 16;
  if (top < 16) top = 16;
  return { left, top };
}
