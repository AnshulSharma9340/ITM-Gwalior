/* Floating "Edit image" badge that anchors over an <img> element.
 *
 * Why this exists: many images on the site are covered by gradient overlays
 * (Hero slider, dept banners) that intercept clicks. The CSS outline +
 * pointer-events approach can't help when the visible click target is
 * something other than the img itself. This component renders a fixed-position
 * badge directly above each editable img at a very high z-index, guaranteed
 * to receive clicks no matter what's underneath.
 *
 * Position is updated on every animation frame so it tracks scroll, resize,
 * route changes, and DOM movement reliably (and cheaply — most frames are
 * no-ops because position only updates when it changes).
 */
import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';

export default function ImageBadgeOverlay({ imgEl, onClick }) {
  const [pos, setPos] = useState(() => readVisibleRect(imgEl));
  const rafRef = useRef(0);
  const lastJson = useRef('');

  useEffect(() => {
    if (!imgEl) return;
    const tick = () => {
      const next = readVisibleRect(imgEl);
      const s = next ? `${next.left}|${next.top}|${next.width}|${next.height}` : '';
      if (s !== lastJson.current) {
        lastJson.current = s;
        setPos(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [imgEl]);

  if (!pos || pos.width < 16 || pos.height < 16) return null;

  return (
    <button
      type="button"
      data-no-edit="1"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      title="Edit image"
      style={{
        position: 'fixed',
        left: pos.left + pos.width - 130,
        top: pos.top + 8,
        zIndex: 9999,
      }}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#800000] text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-[#600000] transition-colors pointer-events-auto"
    >
      <Pencil size={11} /> Edit image
    </button>
  );
}

function readRect(el) {
  if (!el || !el.isConnected) return null;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

/* Returns the bounding rect of `el` only when it's actually visible to the
 * user — opacity > 0.5, display != none, visibility != hidden. Slider frames
 * fading underneath return null so their badge is hidden. */
function readVisibleRect(el) {
  if (!el || !el.isConnected) return null;
  let cs;
  try { cs = window.getComputedStyle(el); } catch { return null; }
  if (cs.display === 'none' || cs.visibility === 'hidden') return null;
  if (parseFloat(cs.opacity || '1') < 0.5) return null;
  return readRect(el);
}
