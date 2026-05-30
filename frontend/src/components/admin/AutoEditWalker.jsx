/* Runtime auto-edit walker.
 *
 * Mounted by EditModeProvider whenever an admin is in edit mode. Walks the
 * page DOM and attaches edit affordances to every:
 *
 *   • text-bearing leaf (h1-h6, p, li, span, a, button, …) — contentEditable
 *   • <img>                                                 — click to edit src
 *   • element with non-empty backgroundImage                — click to edit bg
 *   • list-like container (≥3 same-tag children)            — row delete + reorder
 *
 * Edits persist via the existing setText / setImage / setBg / setListOverride
 * helpers on EditModeContext, which debounce-PUT to /api/admin/page-overrides.
 *
 * Visitors (non-admins) never mount this — the read side lives in
 * applyOverrides and runs in EditModeContext's TextOverrideApplier.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEditMode } from '../../context/EditModeContext';
import {
  computeTkey,
  findEditables,
  findImages,
  findBgImages,
  shouldExclude,
} from './autoEdit/tkey.js';
import ImageEditPopover from './autoEdit/ImageEditPopover.jsx';
import ImageBadgeOverlay from './autoEdit/ImageBadgeOverlay.jsx';

/* Class names */
const C_TEXT = 'auto-editable';
const C_IMG = 'auto-editable-img';
const C_BG = 'auto-editable-bg';
const C_LIST_ROW = 'auto-editable-row';

const PENCIL_BG =
  'url("data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23800000\'>' +
      '<circle cx=\'12\' cy=\'12\' r=\'11\' fill=\'%23ffffff\' stroke=\'%23800000\' stroke-width=\'2\'/>' +
      '<path d=\'M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06m3.66-6.06c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83a.996.996 0 0 0 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z\'/>' +
    '</svg>'
  ) +
  '")';

const STYLE = `
.${C_TEXT} {
  outline: 1px dashed rgba(128, 0, 0, 0.6);
  outline-offset: 2px;
  position: relative;
  cursor: text;
  border-radius: 2px;
  background-image: ${PENCIL_BG};
  background-repeat: no-repeat;
  background-position: top -8px right -8px;
  background-size: 18px 18px;
  padding-right: 10px;
  pointer-events: auto !important;
  transition: outline-color 120ms ease, background-color 120ms ease;
}
.${C_TEXT}:hover { outline-color: #800000; background-color: rgba(128,0,0,0.05); }
.${C_TEXT}:focus { outline: 2px solid #800000; outline-offset: 2px; }

.${C_IMG} {
  outline: 2px dashed rgba(128, 0, 0, 0.5);
  outline-offset: 4px;
  cursor: pointer !important;
  /* NB: no position rule — slider imgs use Tailwind 'absolute' which we
   * must not override or the slider stacks instead of overlapping. */
  pointer-events: auto !important;
  transition: outline-color 120ms ease, box-shadow 120ms ease;
}
.${C_IMG}:hover {
  outline-color: #800000;
  box-shadow: 0 0 0 4px rgba(128,0,0,0.10), 0 8px 24px -8px rgba(128,0,0,0.4);
}

.${C_BG} {
  outline: 2px dashed rgba(128, 0, 0, 0.45);
  outline-offset: -2px;
  cursor: pointer;
  position: relative;
  pointer-events: auto !important;
}
.${C_BG}::after {
  content: '\\270E Edit background';
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: #800000;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 999px;
  box-shadow: 0 6px 18px -4px rgba(0,0,0,0.35);
  opacity: 0;
  transition: opacity 120ms ease;
  pointer-events: none;
}
.${C_BG}:hover::after { opacity: 1; }

.${C_LIST_ROW} {
  position: relative;
}
.${C_LIST_ROW} .auto-row-controls,
.${C_LIST_ROW} .auto-row-controls button {
  pointer-events: auto !important;
}
.${C_LIST_ROW} .auto-row-controls {
  position: absolute;
  top: 4px;
  left: 4px;
  z-index: 60;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 120ms ease;
  background: rgba(128,0,0,0.95);
  color: #fff;
  border-radius: 8px;
  padding: 2px;
  box-shadow: 0 6px 18px -4px rgba(0,0,0,0.35);
}
.${C_LIST_ROW}:hover .auto-row-controls { opacity: 1; }
.${C_LIST_ROW} .auto-row-controls button {
  background: transparent;
  color: #fff;
  border: 0;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
}
.${C_LIST_ROW} .auto-row-controls button:hover { background: rgba(255,255,255,0.18); }
.${C_LIST_ROW}[data-row-hidden="1"] { opacity: 0.35; outline: 1px dashed rgba(128,0,0,0.4); }
`;

/* List-edit detection — strict: only semantic lists (<ul>/<ol>) or elements
 * explicitly marked with data-list-container. Heuristic class matching was
 * too aggressive — it matched every flex/grid container including hero
 * sections, breaking absolute-positioned children with position: relative.
 *
 * Authors can opt a container in by adding data-list-container to its outer
 * element. The CMS will then offer add/remove/reorder on its children.
 */
function findListContainers(root = document.body) {
  if (!root) return [];
  const out = [];
  const candidates = root.querySelectorAll('ul, ol, [data-list-container]');
  for (const el of candidates) {
    if (shouldExclude(el)) continue;
    const children = Array.from(el.children).filter(
      (c) =>
        c.tagName !== 'IMG' &&
        !c.hasAttribute('data-no-edit') &&
        !c.hasAttribute('data-edit-wrapper')
    );
    if (children.length < 2) continue;
    const tag = children[0].tagName;
    if (!children.every((c) => c.tagName === tag)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 200 || r.height < 60) continue;
    out.push({ container: el, children });
  }
  return out;
}

export default function AutoEditWalker() {
  const { editMode, getText, setText, getImage, setImage, getBg, setBg, getListOverride, setListOverride } = useEditMode();
  const location = useLocation();
  const pageKey = location.pathname;
  const processedRef = useRef(new WeakSet());
  const observerRef = useRef(null);
  const rafRef = useRef(0);
  const styleRef = useRef(null);
  const [popover, setPopover] = useState(null); // { tkey, currentSrc, mode, anchor, el }
  const [imgEls, setImgEls] = useState([]);     // every editable <img> currently in DOM

  /* Helpers exposed to local handlers */
  const safeStr = (v) => (typeof v === 'string' ? v : '');

  /* ─── Text: wire one element ─── */
  const wireText = (el) => {
    if (shouldExclude(el)) return;
    const tkey = computeTkey(el);
    if (!tkey) return;
    el.dataset.tkey = tkey;
    if (!el.classList.contains(C_TEXT)) el.classList.add(C_TEXT);
    if (el.getAttribute('contenteditable') !== 'true') el.setAttribute('contenteditable', 'true');
    if (el.getAttribute('spellcheck') !== 'false') el.setAttribute('spellcheck', 'false');
    if (processedRef.current.has(el)) return;

    const onBlur = () => {
      const next = (el.innerText || '').trim();
      const current = (getText(pageKey, tkey, '') || '').trim();
      if (next === current) return;
      setText(pageKey, tkey, next);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        el.blur();
      }
      e.stopPropagation();
    };
    const onClick = (e) => e.stopPropagation();
    el.addEventListener('blur', onBlur);
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('click', onClick);
    processedRef.current.add(el);
  };

  /* ─── Image: wire one <img> ─── */
  const wireImage = (el) => {
    if (shouldExclude(el)) return;
    const tkey = computeTkey(el);
    if (!tkey) return;
    // React may have re-rendered and wiped className — re-add unconditionally.
    el.dataset.tkey = tkey;
    if (!el.classList.contains(C_IMG)) el.classList.add(C_IMG);
    // Click listener: attach only once per element via processedRef.
    if (processedRef.current.has(el)) return;

    const onClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      setPopover({
        tkey,
        currentSrc: getImage(pageKey, tkey, el.getAttribute('src') || ''),
        mode: 'img',
        anchor: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        el,
      });
    };
    el.addEventListener('click', onClick);
    // Re-scan when this img finishes loading (lazy-loaded sliders, deferred CMS imgs).
    if (!el.complete) {
      const onLoad = () => { try { el.removeEventListener('load', onLoad); } catch {} scan(); };
      el.addEventListener('load', onLoad);
    }
    processedRef.current.add(el);
  };

  /* ─── Background image: wire one element ─── */
  const wireBg = (el) => {
    if (shouldExclude(el)) return;
    const tkey = computeTkey(el);
    if (!tkey) return;
    el.dataset.tkey = tkey;
    if (!el.classList.contains(C_BG)) el.classList.add(C_BG);
    if (processedRef.current.has(el)) return;

    const onClick = (e) => {
      // Don't fire if the click landed on a more-specific affordance.
      const t = e.target;
      if (t === el) {
        /* bg edge / decorative area — fall through to open bg editor */
      } else {
        // Walk up from target — if we hit a text/img affordance before hitting
        // this bg el, let that handler take priority.
        let cur = t;
        while (cur && cur !== el) {
          if (
            cur.classList && (
              cur.classList.contains(C_TEXT) ||
              cur.classList.contains(C_IMG) ||
              cur.classList.contains(C_LIST_ROW)
            )
          ) return;
          // Also let buttons / interactive controls fire normally
          if (cur.tagName === 'BUTTON' || cur.tagName === 'A') return;
          cur = cur.parentElement;
        }
      }
      e.preventDefault();
      e.stopPropagation();
      const rect = el.getBoundingClientRect();
      const cur = safeStr(getBg(pageKey, tkey, ''));
      setPopover({
        tkey,
        currentSrc: cur,
        mode: 'bg',
        anchor: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
        el,
      });
    };
    el.addEventListener('click', onClick);
    processedRef.current.add(el);
  };

  /* ─── List: wire one container ─── */
  const wireListContainer = ({ container, children }) => {
    if (processedRef.current.has(container)) return;
    if (shouldExclude(container)) return;
    const containerKey = computeTkey(container);
    if (!containerKey) return;
    container.dataset.tkey = containerKey;
    container.setAttribute('data-list-container', '1');

    for (const child of children) {
      if (processedRef.current.has(child)) continue;
      const rowKey = computeTkey(child);
      if (!rowKey) continue;
      child.dataset.tkey = rowKey;
      child.classList.add(C_LIST_ROW);

      // Build controls
      const ctrl = document.createElement('div');
      ctrl.className = 'auto-row-controls';
      ctrl.setAttribute('data-no-edit', '1');
      ctrl.innerHTML = `
        <button type="button" data-act="up" title="Move up" aria-label="Move up">${SVG_UP}</button>
        <button type="button" data-act="down" title="Move down" aria-label="Move down">${SVG_DOWN}</button>
        <button type="button" data-act="del" title="Hide row" aria-label="Hide row">${SVG_DEL}</button>
      `;
      ctrl.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const act = btn.dataset.act;
        const spec = getListOverride(pageKey, containerKey) || {};
        if (act === 'del') {
          const hidden = { ...(spec.hidden || {}), [rowKey]: true };
          setListOverride(pageKey, containerKey, { ...spec, hidden });
          child.dataset.rowHidden = '1';
        } else {
          // Reorder
          const currentOrder = (spec.order && spec.order.length > 0)
            ? spec.order.slice()
            : children.map((c) => computeTkey(c));
          const idx = currentOrder.indexOf(rowKey);
          const swap = idx + (act === 'up' ? -1 : 1);
          if (idx < 0 || swap < 0 || swap >= currentOrder.length) return;
          [currentOrder[idx], currentOrder[swap]] = [currentOrder[swap], currentOrder[idx]];
          setListOverride(pageKey, containerKey, { ...spec, order: currentOrder });
        }
        e.stopPropagation();
      });
      child.appendChild(ctrl);
      processedRef.current.add(child);
    }
    processedRef.current.add(container);
  };

  const unwire = (el) => {
    if (!el || !el.classList) return;
    el.classList.remove(C_TEXT, C_IMG, C_BG, C_LIST_ROW);
    el.removeAttribute('contenteditable');
    el.removeAttribute('spellcheck');
    if (el.dataset) delete el.dataset.rowHidden;
    // Remove appended row-control buttons (if any)
    el.querySelectorAll && el
      .querySelectorAll('.auto-row-controls')
      .forEach((n) => n.remove());
  };

  const scan = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      try {
        observerRef.current && observerRef.current.disconnect();
        for (const el of findEditables(document.body)) wireText(el);
        const imgs = findImages(document.body);
        for (const el of imgs) wireImage(el);
        for (const el of findBgImages(document.body)) wireBg(el);
        for (const list of findListContainers(document.body)) wireListContainer(list);
        // Track imgs for floating badge overlays. Only update state if the
        // set of imgs changed.
        setImgEls((prev) => {
          if (prev.length === imgs.length && prev.every((e, i) => e === imgs[i])) return prev;
          return imgs;
        });
        // Override application happens via TextOverrideApplier in EditModeContext
        // which observes the same mutations and runs applyAllOverrides.
      } catch { /* never break the host */ }
      finally {
        observerRef.current && observerRef.current.observe(document.body, { childList: true, subtree: true });
      }
    });
  };

  /* Mount on edit mode */
  useEffect(() => {
    if (!editMode) return;
    if (!styleRef.current) {
      const s = document.createElement('style');
      s.setAttribute('data-auto-edit', '1');
      s.textContent = STYLE;
      document.head.appendChild(s);
      styleRef.current = s;
    }
    scan();
    const obs = new MutationObserver(() => scan());
    obs.observe(document.body, { childList: true, subtree: true });
    observerRef.current = obs;
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      obs.disconnect();
      observerRef.current = null;
      document
        .querySelectorAll('.' + C_TEXT + ',.' + C_IMG + ',.' + C_BG + ',.' + C_LIST_ROW)
        .forEach(unwire);
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
      processedRef.current = new WeakSet();
      setPopover(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode]);

  /* Re-scan on route change */
  useEffect(() => {
    if (!editMode) return;
    processedRef.current = new WeakSet();
    scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey, editMode]);

  /* Open the image popover for a given <img> (called by badge overlays). */
  const openImagePopover = (el) => {
    const tkey = computeTkey(el);
    if (!tkey) return;
    const rect = el.getBoundingClientRect();
    setPopover({
      tkey,
      currentSrc: getImage(pageKey, tkey, el.getAttribute('src') || ''),
      mode: 'img',
      anchor: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height },
      el,
    });
  };

  /* Save image / bg from popover */
  const handlePopoverSave = (newSrc) => {
    if (!popover) return;
    const { tkey, mode, el } = popover;
    if (mode === 'img') {
      // Special sentinel: "__hide__" means visually hide the image entirely.
      if (newSrc === '__hide__') {
        setImage(pageKey, tkey, '__hide__');
        if (el) el.style.display = 'none';
      } else {
        setImage(pageKey, tkey, newSrc); // null clears the override
        if (newSrc && el) {
          el.src = newSrc;
          el.style.display = '';
        } else if (el) {
          // null/empty → restore original src (best-effort: keep current src as React owns it)
          el.style.display = '';
        }
      }
    } else {
      setBg(pageKey, tkey, newSrc);
      if (newSrc && el) el.style.backgroundImage = `url("${newSrc}")`;
      else if (el) el.style.backgroundImage = ''; // restore CSS
    }
    setPopover(null);
  };

  return (
    <>
      {/* One floating badge per editable <img> — guaranteed-clickable regardless of overlays */}
      {imgEls.map((el, i) => (
        <ImageBadgeOverlay key={i} imgEl={el} onClick={() => openImagePopover(el)} />
      ))}
      {popover ? (
        <ImageEditPopover
          tkey={popover.tkey}
          currentSrc={popover.currentSrc}
          mode={popover.mode}
          anchor={popover.anchor}
          onSave={handlePopoverSave}
          onClose={() => setPopover(null)}
        />
      ) : null}
    </>
  );
}

/* Inline SVG strings — used in dynamically-built control bar. */
const SVG_UP = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15 6-6 6 6"/></svg>';
const SVG_DOWN = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
const SVG_DEL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
