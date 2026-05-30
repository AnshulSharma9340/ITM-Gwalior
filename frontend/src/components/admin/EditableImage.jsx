import { useRef, useState } from 'react';
import { useEditMode } from '../../context/EditModeContext';
import { Pencil, Link2, Upload, X, RotateCcw } from 'lucide-react';

const MAX_UPLOAD_BYTES = 1.8 * 1024 * 1024; // keep data URLs under the localStorage budget

/*
 * Click-to-replace image. Renders an <img> whose src is the local override (if
 * any) or the provided `src`. In edit mode an overlay button opens a small panel
 * to paste an image URL or upload a file (stored inline as a data URL, since
 * persistence is local-only). Saves to the page's media overrides.
 */
export default function EditableImage({
  pageKey,
  tkey,
  src,
  alt = '',
  className = '',
  wrapperClassName = '',
  ...imgProps
}) {
  const { editMode, getImage, setImage } = useEditMode();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef(null);

  const effectiveSrc = getImage(pageKey, tkey, src);

  const onFile = (file) => {
    setErr('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErr('Please choose an image file.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErr('Image is too large (max ~1.8 MB). Paste a URL instead.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(pageKey, tkey, reader.result);
      setOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const img = <img src={effectiveSrc} alt={alt} className={className} {...imgProps} />;

  if (!editMode) return img;

  return (
    <span
      className={`${wrapperClassName || 'relative inline-block align-top'} pointer-events-auto group/img`}
    >
      <span className="block h-full ring-2 ring-dashed ring-[#800000]/60 hover:ring-[#800000] rounded-sm transition-shadow">{img}</span>

      {/* Trigger — persistent pencil badge, brand maroon to match EditableText */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        title="Edit / replace image"
        className="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#800000] text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#600000] transition-colors"
      >
        <Pencil size={13} /> Edit image
      </button>

      {/* Editor panel */}
      {open && (
        <span
          onClick={(e) => e.stopPropagation()}
          className="absolute top-12 left-2 z-40 w-72 block rounded-xl bg-white dark:bg-[#0a0e1a] border border-gray-200 dark:border-white/10 shadow-2xl p-3 text-left"
        >
          <span className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-gray-500">
              Replace image
            </span>
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </span>

          {/* URL input */}
          <span className="flex items-center gap-1.5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 mb-2">
            <Link2 size={13} className="text-gray-400 shrink-0" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste image URL…"
              className="flex-1 bg-transparent text-xs outline-none text-gray-800 dark:text-white"
            />
            <button
              type="button"
              disabled={!url.trim()}
              onClick={() => {
                setImage(pageKey, tkey, url.trim());
                setUrl('');
                setOpen(false);
              }}
              className="text-[10px] font-black uppercase px-2 py-1 rounded bg-violet-600 text-white disabled:opacity-40"
            >
              Set
            </button>
          </span>

          {/* Upload */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-white/15 text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 transition-colors"
          >
            <Upload size={13} /> Upload from device
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />

          {getImage(pageKey, tkey, null) && (
            <button
              type="button"
              onClick={() => {
                setImage(pageKey, tkey, src);
                setOpen(false);
              }}
              className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#800000]"
            >
              <RotateCcw size={11} /> Restore original
            </button>
          )}

          {err && <span className="block mt-2 text-[11px] text-red-600 font-semibold">{err}</span>}
        </span>
      )}
    </span>
  );
}
