/* Apply backend overrides to the live DOM.
 *
 * Called for both admins (in addition to attaching edit affordances) and
 * visitors (read-only). Walks the DOM, computes per-element tkeys, and applies:
 *   • text   — replaces innerText of text-bearing leaves
 *   • media  — replaces <img>.src
 *   • bg     — replaces element style.backgroundImage
 *   • lists  — for list-like containers, hides items in `hidden` set and
 *              reorders children to match `order` (best-effort)
 */
import { computeTkey, findEditables, findImages, findBgImages } from './tkey.js';

export function applyTextOverrides(overrides, root = document.body) {
  const map = overrides?.text;
  if (!map || typeof map !== 'object') return 0;
  let applied = 0;
  for (const el of findEditables(root)) {
    const key = computeTkey(el);
    if (!key || !(key in map)) continue;
    const next = map[key];
    if (typeof next !== 'string') continue;
    const current = (el.textContent || '').trim();
    if (current === next.trim()) continue;
    el.textContent = next;
    applied++;
  }
  return applied;
}

export function applyImageOverrides(overrides, root = document.body) {
  const map = overrides?.media;
  if (!map || typeof map !== 'object') return 0;
  let applied = 0;
  for (const el of findImages(root)) {
    const key = computeTkey(el);
    if (!key || !(key in map)) continue;
    const next = map[key];
    if (typeof next !== 'string' || !next) continue;
    if (next === '__hide__') {
      if (el.style.display !== 'none') { el.style.display = 'none'; applied++; }
      continue;
    }
    if (el.style.display === 'none') el.style.display = '';
    if (el.src === next) continue;
    el.src = next;
    applied++;
  }
  return applied;
}

export function applyBgOverrides(overrides, root = document.body) {
  const map = overrides?.bg;
  if (!map || typeof map !== 'object') return 0;
  let applied = 0;
  for (const el of findBgImages(root)) {
    const key = computeTkey(el);
    if (!key || !(key in map)) continue;
    const next = map[key];
    if (typeof next !== 'string' || !next) continue;
    const want = `url("${next}")`;
    if (el.style.backgroundImage === want) continue;
    el.style.backgroundImage = want;
    applied++;
  }
  return applied;
}

export function applyListOverrides(overrides, root = document.body) {
  const map = overrides?.lists;
  if (!map || typeof map !== 'object') return 0;
  let applied = 0;
  for (const [containerKey, spec] of Object.entries(map)) {
    if (!spec || typeof spec !== 'object') continue;
    // Find a container in the DOM whose computed tkey matches.
    let container = null;
    // We can't iterate every element cheaply; use a heuristic: search elements
    // whose data-list-container attribute already matches, otherwise scan.
    const candidates = root.querySelectorAll('[data-list-container]');
    for (const c of candidates) {
      if (computeTkey(c) === containerKey) { container = c; break; }
    }
    if (!container) continue;
    // Hidden items
    const hidden = spec.hidden || {};
    for (const child of Array.from(container.children)) {
      const k = computeTkey(child);
      if (k && hidden[k]) {
        child.style.display = 'none';
        applied++;
      }
    }
    // Order (best-effort — assumes existing children have stable tkeys)
    if (Array.isArray(spec.order) && spec.order.length > 0) {
      const byKey = new Map();
      for (const child of Array.from(container.children)) {
        const k = computeTkey(child);
        if (k) byKey.set(k, child);
      }
      for (const targetKey of spec.order) {
        const el = byKey.get(targetKey);
        if (el) container.appendChild(el); // moves to end in order
      }
      applied++;
    }
  }
  return applied;
}

export function applyAllOverrides(overrides, root = document.body) {
  let n = 0;
  n += applyTextOverrides(overrides, root);
  n += applyImageOverrides(overrides, root);
  n += applyBgOverrides(overrides, root);
  n += applyListOverrides(overrides, root);
  return n;
}
