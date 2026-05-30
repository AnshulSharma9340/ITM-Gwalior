/* Stable per-element identifier ("tkey") used to key inline overrides.
 *
 * The tkey is derived from the DOM ancestor path so it survives React re-renders
 * and stays stable even if the visible text changes. Content is NOT part of the
 * tkey — the same element keeps its key when an editor changes the text.
 *
 * Priority order when building the path:
 *  1. Nearest ancestor with `data-section="<name>"` becomes the anchor.
 *     Authors can add this to major section components for nice short keys.
 *  2. Otherwise: walk up at most MAX_DEPTH ancestors, recording
 *     `tagName` + nth-of-type among siblings of the same tag.
 *  3. Stop at <body> or after MAX_DEPTH hops.
 *
 * Example:
 *   <main>
 *     <section data-section="hero">
 *       <h1>Welcome</h1>          → "auto.hero.h1"
 *       <p>Subhead</p>            → "auto.hero.p"
 *       <ul>
 *         <li>Item one</li>       → "auto.hero.ul.li"
 *         <li>Item two</li>       → "auto.hero.ul.li1"
 *       </ul>
 *     </section>
 *   </main>
 */

const MAX_DEPTH = 6;

// Elements that are part of the admin chrome and don't exist for visitors.
// Treated as transparent — their children are promoted up to the phantom's
// own parent for both nth-of-type and ancestor-walking purposes.
function isPhantom(el) {
  return (
    el.nodeType === 1 &&
    (el.hasAttribute('data-no-edit') || el.hasAttribute('data-edit-wrapper'))
  );
}

function effectiveParent(el) {
  let p = el.parentElement;
  while (p && isPhantom(p)) p = p.parentElement;
  return p;
}

// Return the flat list of "effective children" of a parent: real children,
// with each phantom child replaced by its own children (recursively).
function effectiveChildren(parent) {
  const out = [];
  for (const child of parent.children) {
    if (isPhantom(child)) out.push(...effectiveChildren(child));
    else out.push(child);
  }
  return out;
}

function nthOfType(el) {
  const p = effectiveParent(el);
  if (!p) return 0;
  const sibs = effectiveChildren(p).filter((c) => c.tagName === el.tagName);
  return sibs.indexOf(el);
}

function segment(el) {
  const tag = el.tagName.toLowerCase();
  const n = nthOfType(el);
  return n > 0 ? `${tag}${n}` : tag;
}

export function computeTkey(el) {
  if (!el || el.nodeType !== 1) return null;
  const parts = [];
  let cur = el;
  let hops = 0;
  while (hops < MAX_DEPTH) {
    if (!cur || cur === document.body || cur === document.documentElement) break;
    const section = cur.dataset && cur.dataset.section;
    if (section) {
      // Anchor found — the leaf-to-anchor segments are already in `parts`.
      // Prepend the anchor name and stop.
      parts.unshift(section);
      return 'auto.' + parts.join('.');
    }
    parts.unshift(segment(cur));
    hops++;
    cur = effectiveParent(cur); // skip phantom wrappers
  }
  return 'auto.' + parts.join('.');
}

/* ─── Excluder ──────────────────────────────────────────────────────── */

const EXCLUDED_TAGS = new Set([
  'NAV', 'HEADER', 'INPUT', 'SELECT', 'TEXTAREA', 'LABEL', 'IFRAME',
  'SVG', 'PATH', 'CIRCLE', 'RECT', 'POLYGON', 'LINE', 'G', 'DEFS',
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TIME',
]);

const EXCLUDED_CLASS_FRAGMENTS = [
  'admin-edit',           // AdminEditBar itself
  'lucide',               // lucide-react icons
  'react-icons',
  'sr-only',              // screen-reader text
];

const EXCLUDED_SELECTORS = [
  '[data-no-edit]',
  '[contenteditable]',     // already manually editable via <EditableText>
  '[role="navigation"]',
  '[role="menubar"]',
  '[role="menu"]',
  '[role="dialog"]',
  '[aria-hidden="true"]',
];

function ancestorMatchesAny(el, predicate) {
  let cur = el;
  while (cur) {
    if (predicate(cur)) return true;
    cur = cur.parentElement;
  }
  return false;
}

export function shouldExclude(el) {
  if (!el || el.nodeType !== 1) return true;
  if (EXCLUDED_TAGS.has(el.tagName)) return true;

  // Exclude if any ancestor matches an excluded selector or has an excluded tag.
  if (
    ancestorMatchesAny(el, (a) => {
      if (EXCLUDED_TAGS.has(a.tagName)) return true;
      for (const sel of EXCLUDED_SELECTORS) {
        try { if (a.matches && a.matches(sel)) return true; } catch { /* invalid sel */ }
      }
      const cls = a.className && typeof a.className === 'string' ? a.className : '';
      for (const frag of EXCLUDED_CLASS_FRAGMENTS) {
        if (cls.includes(frag)) return true;
      }
      return false;
    })
  ) {
    return true;
  }

  return false;
}

/* ─── Candidate discovery ───────────────────────────────────────────── */

const CANDIDATE_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'span', 'a', 'button', 'figcaption', 'blockquote', 'dt', 'dd', 'td', 'th'];

/* Find every <img> below `root` that should be image-editable. All visible AND
 * currently-invisible imgs are wired — the floating badge polls visibility on
 * every frame and only shows itself for the currently-visible img (so slider
 * frames cycling underneath still have a badge that appears at the right moment).
 */
export function findImages(root = document.body) {
  if (!root) return [];
  const out = [];
  for (const el of root.querySelectorAll('img')) {
    if (shouldExclude(el)) continue;
    let cs;
    try { cs = window.getComputedStyle(el); } catch { continue; }
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (el.complete && (r.width < 8 || r.height < 8)) continue;
    out.push(el);
  }
  return out;
}

/* Find every element that can host a background image override.
 *
 * Two classes of candidate:
 *  1. Elements that already have a `url(...)` background — natural images.
 *  2. Elements explicitly marked as section anchors (`data-section`) — these
 *     are treated as banners even if they currently only show a gradient or
 *     solid colour. Editors can drop an image onto any banner.
 */
export function findBgImages(root = document.body) {
  if (!root) return [];
  const out = [];
  const seen = new Set();
  // Class 1: explicit url() bgs
  const bgCandidates = root.querySelectorAll('section, div, header, footer, aside, main, article');
  for (const el of bgCandidates) {
    if (shouldExclude(el)) continue;
    let bg = '';
    try { bg = window.getComputedStyle(el).backgroundImage; } catch { continue; }
    if (!bg || bg === 'none' || bg.indexOf('url(') === -1) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 80 || r.height < 60) continue;
    if (seen.has(el)) continue;
    seen.add(el);
    out.push(el);
  }
  // Class 2: section-anchored elements (banners) — admin can drop an image
  // even on a gradient. Their bounding box must be large enough to be banner-ish.
  // But: skip sections that are already mostly covered by visible <img> tags
  // (Hero slider, etc.) — there the user should click the image badges instead;
  // a CSS background under opaque images would be invisible.
  for (const el of root.querySelectorAll('[data-section]')) {
    if (shouldExclude(el)) continue;
    if (seen.has(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 200 || r.height < 100) continue;
    if (sectionMostlyCoveredByImgs(el, r)) continue;
    seen.add(el);
    out.push(el);
  }
  return out;
}

/* Returns true if `section` contains any non-decorative <img> tags. We treat
 * the mere presence of large-ish imgs as "the section's background can't
 * meaningfully be edited because the imgs cover it". This runs at first-scan
 * time when imgs may not have loaded yet, so we look at the IMG elements
 * themselves rather than at their bounding rects.
 *
 * Decorative imgs (logos, badges, small icons) are skipped via the same
 * exclude/size heuristics findImages uses.
 */
function sectionMostlyCoveredByImgs(section, sectionRect) {
  const imgs = section.querySelectorAll('img');
  if (imgs.length === 0) return false;
  // Look for at least one img positioned to fill the section (absolute/inset)
  // OR an img whose natural-or-rendered size is reasonably large.
  for (const img of imgs) {
    if (shouldExclude(img)) continue;
    let cs;
    try { cs = window.getComputedStyle(img); } catch { continue; }
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    // Absolute / fixed-positioned imgs almost always cover their parent —
    // common pattern for hero sliders, page banners.
    if (cs.position === 'absolute' || cs.position === 'fixed') return true;
    // Otherwise: imgs at least 30% of section dimensions are "covering".
    const r = img.getBoundingClientRect();
    if (sectionRect.width > 0 && sectionRect.height > 0 && r.width > 0 && r.height > 0) {
      if (r.width / sectionRect.width > 0.3 && r.height / sectionRect.height > 0.3) return true;
    }
  }
  return false;
}

function hasMeaningfulText(el) {
  const txt = (el.textContent || '').trim();
  if (txt.length < 2) return false;
  // Skip pure-icon labels (single emoji, single special char).
  if (txt.length <= 2 && !/[a-zA-Z0-9]/.test(txt)) return false;
  return true;
}

function isLeafEditable(el) {
  // A text-bearing element with no nested block children. We allow inline
  // children (em/strong/span/a/code) since contentEditable handles them.
  for (const child of el.children) {
    const t = child.tagName;
    if (!['STRONG', 'EM', 'B', 'I', 'U', 'SPAN', 'BR', 'CODE', 'SUP', 'SUB', 'MARK', 'SMALL'].includes(t)) {
      return false;
    }
  }
  return true;
}

/* Find every visible, eligible, leaf-ish editable element under `root`. */
export function findEditables(root = document.body) {
  if (!root) return [];
  const sel = CANDIDATE_TAGS.join(',');
  const out = [];
  const seen = new WeakSet();
  for (const el of root.querySelectorAll(sel)) {
    if (seen.has(el)) continue;
    if (shouldExclude(el)) continue;
    if (!hasMeaningfulText(el)) continue;
    if (!isLeafEditable(el)) continue;
    // Don't double-process if an ancestor we already added contains this.
    let coveredByAncestor = false;
    let cur = el.parentElement;
    while (cur && cur !== document.body) {
      if (seen.has(cur)) { coveredByAncestor = true; break; }
      cur = cur.parentElement;
    }
    if (coveredByAncestor) continue;
    seen.add(el);
    out.push(el);
  }
  return out;
}
