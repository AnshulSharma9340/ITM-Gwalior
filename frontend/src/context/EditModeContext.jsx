import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { pageOverridesApi } from '../api/pageOverrides';
import AutoEditWalker from '../components/admin/AutoEditWalker';
import { applyAllOverrides } from '../components/admin/autoEdit/applyOverrides';

/*
 * Live "edit mode" for the public site, backed by the API.
 *
 * Admins edit pages in place — either via the floating pencil on the live site,
 * or inside the Pages & SEO dashboard, which loads each page in an embedded
 * preview with edit mode auto-enabled. Editable surfaces:
 *   • layout blocks  — reorder / hide   (see EditableSection)
 *   • text           — click to edit    (see EditableText)
 *   • images         — click to replace (see EditableImage)
 *   • lists          — add/remove/reorder rows  (see EditableList)
 *
 * Persistence:
 *   • Each public route has one row in the backend `settings` table
 *     (`page_overrides:{path}`), serving as a JSON blob.
 *   • Public visitors GET that blob (cached 30s at the edge).
 *   • Admins PUT changes; writes are debounced 350ms per path.
 *   • Cross-tab sync via the `storage` event still works for non-admins reading
 *     a recently-edited page on the same machine.
 *
 * Stored shape (per pageKey/path):
 *   { order: [...], hidden: {...}, text: {...}, media: {...}, lists: {...} }
 *
 * Migration: on first mount, any leftover entries in `localStorage.itm_layout_overrides`
 * are pushed up to the backend, then the local key is cleared. Guarded by a
 * `localStorage.itm_overrides_migrated_v1 = '1'` flag.
 */

const LEGACY_STORAGE_KEY = 'itm_layout_overrides';
const MIGRATION_FLAG = 'itm_overrides_migrated_v1';
const SAVE_DEBOUNCE_MS = 350;

const EditModeContext = createContext(null);

// True when running inside an <iframe> — i.e. the dashboard's preview pane.
export function isEmbeddedPreview() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin access throws → we're framed
  }
}

function readLegacyOverrides() {
  try {
    return JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

export function EditModeProvider({ children }) {
  const { isAdmin, isEditor } = useAuth();
  // Editors get the same in-place edit affordances as admins; backend RBAC
  // (scope `site.pages`) gates whether their PUTs actually persist.
  const canEdit = isAdmin || isEditor;
  // In the embedded preview, start in edit mode immediately.
  const [editMode, setEditMode] = useState(() => isEmbeddedPreview());
  // In-memory cache keyed by pageKey (path). Each entry is the page's full
  // overrides blob. Pages we've never fetched aren't present.
  const [overrides, setOverrides] = useState({});
  // Save-state machine, used by the toolbar.  idle | saving | saved | error
  const [saveStatus, setSaveStatus] = useState('idle');
  // Paths we've already fetched (so we don't re-fetch on every render).
  const fetchedPaths = useRef(new Set());
  // Pending debounce timers per pageKey.
  const saveTimers = useRef(new Map());
  // Pending blobs that haven't been flushed yet (for beforeunload sync).
  const pendingBlobs = useRef(new Map());

  /* ── Fetch a path's overrides on first access ───────────────────────── */

  const ensureFetched = useCallback(
    (pageKey) => {
      if (!pageKey || fetchedPaths.current.has(pageKey)) return;
      fetchedPaths.current.add(pageKey); // optimistic — avoid duplicate fetches
      const reader = canEdit ? pageOverridesApi.adminGet : pageOverridesApi.publicGet;
      reader(pageKey)
        .then((blob) => {
          setOverrides((prev) => ({ ...prev, [pageKey]: blob || {} }));
        })
        .catch(() => {
          // 401/403/500 — leave the cache empty; readers will fall through to defaults.
        });
    },
    [canEdit]
  );

  /* ── Debounced save for a single pageKey ────────────────────────────── */

  const scheduleSave = useCallback((pageKey, blob) => {
    if (!pageKey) return;
    pendingBlobs.current.set(pageKey, blob);
    const existing = saveTimers.current.get(pageKey);
    if (existing) clearTimeout(existing);
    setSaveStatus('saving');
    const timer = setTimeout(() => {
      saveTimers.current.delete(pageKey);
      pageOverridesApi
        .put(pageKey, blob)
        .then(() => {
          pendingBlobs.current.delete(pageKey);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 1200);
        })
        .catch(() => {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus('idle'), 2500);
        });
    }, SAVE_DEBOUNCE_MS);
    saveTimers.current.set(pageKey, timer);
  }, []);

  // Flush any pending saves synchronously on unload — best-effort.
  useEffect(() => {
    const onBeforeUnload = () => {
      if (pendingBlobs.current.size === 0) return;
      for (const [path, blob] of pendingBlobs.current) {
        // `sendBeacon` survives navigation; falls back to sync fetch on browsers without it.
        try {
          const url = `${window.location.origin}/api/admin/page-overrides${path.startsWith('/') ? path : '/' + path}`;
          const data = new Blob([JSON.stringify(blob)], { type: 'application/json' });
          navigator.sendBeacon?.(url, data);
        } catch { /* swallow */ }
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  /* ── One-time migration: localStorage → backend ─────────────────────── */

  useEffect(() => {
    if (!canEdit) return; // only admins/editors can PUT
    if (localStorage.getItem(MIGRATION_FLAG)) return;
    const legacy = readLegacyOverrides();
    const paths = Object.keys(legacy);
    if (paths.length === 0) {
      localStorage.setItem(MIGRATION_FLAG, '1');
      return;
    }
    Promise.all(
      paths.map((p) => pageOverridesApi.put(p, legacy[p]).catch(() => null))
    ).finally(() => {
      try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch {}
      try { localStorage.setItem(MIGRATION_FLAG, '1'); } catch {}
    });
  }, [canEdit]);

  /* ── Mutation helper ────────────────────────────────────────────────── */

  const patchPage = useCallback((pageKey, updater) => {
    setOverrides((prev) => {
      const current = prev[pageKey] || {};
      const next = updater(current);
      const map = { ...prev, [pageKey]: next };
      // Schedule a backend save outside of render.
      Promise.resolve().then(() => scheduleSave(pageKey, next));
      return map;
    });
  }, [scheduleSave]);

  /* ── Layout: order + visibility of named blocks ─────────────────────── */

  const getLayout = useCallback(
    (pageKey, defaultKeys) => {
      ensureFetched(pageKey);
      const page = overrides[pageKey] || {};
      const hidden = page.hidden || {};
      const savedOrder = Array.isArray(page.order) ? page.order : [];

      const known = new Set(defaultKeys);
      const ordered = savedOrder.filter((k) => known.has(k));
      for (const k of defaultKeys) if (!ordered.includes(k)) ordered.push(k);

      return { order: ordered, hidden };
    },
    [overrides, ensureFetched]
  );

  const moveSection = useCallback(
    (pageKey, defaultKeys, key, dir) => {
      patchPage(pageKey, (page) => {
        const { order } = getLayout(pageKey, defaultKeys);
        const idx = order.indexOf(key);
        const swap = idx + dir;
        if (idx === -1 || swap < 0 || swap >= order.length) return page;
        const next = [...order];
        [next[idx], next[swap]] = [next[swap], next[idx]];
        return { ...page, order: next };
      });
    },
    [patchPage, getLayout]
  );

  const toggleHidden = useCallback(
    (pageKey, key) => {
      patchPage(pageKey, (page) => {
        const hidden = { ...(page.hidden || {}) };
        if (hidden[key]) delete hidden[key];
        else hidden[key] = true;
        return { ...page, hidden };
      });
    },
    [patchPage]
  );

  /* ── Inline text overrides ──────────────────────────────────────────── */

  const getText = useCallback(
    (pageKey, key, fallback) => {
      ensureFetched(pageKey);
      const text = overrides[pageKey]?.text;
      return text && key in text ? text[key] : fallback;
    },
    [overrides, ensureFetched]
  );

  const setText = useCallback(
    (pageKey, key, value) => {
      patchPage(pageKey, (page) => ({
        ...page,
        text: { ...(page.text || {}), [key]: value },
      }));
    },
    [patchPage]
  );

  /* ── Inline image overrides ─────────────────────────────────────────── */

  const getImage = useCallback(
    (pageKey, key, fallback) => {
      ensureFetched(pageKey);
      const media = overrides[pageKey]?.media;
      return media && key in media ? media[key] : fallback;
    },
    [overrides, ensureFetched]
  );

  const setImage = useCallback(
    (pageKey, key, value) => {
      patchPage(pageKey, (page) => {
        const media = { ...(page.media || {}) };
        if (value == null) delete media[key]; // null/undefined clears the override
        else media[key] = value;
        return { ...page, media };
      });
    },
    [patchPage]
  );

  /* ── Background-image overrides ─────────────────────────────────────── */

  const getBg = useCallback(
    (pageKey, key, fallback) => {
      ensureFetched(pageKey);
      const bg = overrides[pageKey]?.bg;
      return bg && key in bg ? bg[key] : fallback;
    },
    [overrides, ensureFetched]
  );

  const setBg = useCallback(
    (pageKey, key, value) => {
      patchPage(pageKey, (page) => {
        const bg = { ...(page.bg || {}) };
        if (value == null || value === '') delete bg[key];
        else bg[key] = value;
        return { ...page, bg };
      });
    },
    [patchPage]
  );

  /* ── List overrides keyed by container tkey (auto-edit lists) ───────── */

  const getListOverride = useCallback(
    (pageKey, containerKey) => {
      ensureFetched(pageKey);
      const lists = overrides[pageKey]?.lists;
      return lists && containerKey in lists ? lists[containerKey] : null;
    },
    [overrides, ensureFetched]
  );

  const setListOverride = useCallback(
    (pageKey, containerKey, spec) => {
      patchPage(pageKey, (page) => {
        const lists = { ...(page.lists || {}) };
        if (spec == null) delete lists[containerKey];
        else lists[containerKey] = spec;
        return { ...page, lists };
      });
    },
    [patchPage]
  );

  /* ── List overrides (add / edit / remove / reorder rows) ────────────── */

  const getList = useCallback(
    (pageKey, key, base) => {
      ensureFetched(pageKey);
      const lists = overrides[pageKey]?.lists;
      return lists && key in lists ? lists[key] : base;
    },
    [overrides, ensureFetched]
  );

  const writeList = useCallback(
    (pageKey, key, base, transform) => {
      patchPage(pageKey, (page) => {
        const lists = page.lists || {};
        const current = (key in lists ? lists[key] : base) || [];
        return { ...page, lists: { ...lists, [key]: transform([...current]) } };
      });
    },
    [patchPage]
  );

  const updateListItem = useCallback(
    (pageKey, key, base, index, value) =>
      writeList(pageKey, key, base, (arr) => {
        arr[index] = value;
        return arr;
      }),
    [writeList]
  );

  const updateListField = useCallback(
    (pageKey, key, base, index, field, value) =>
      writeList(pageKey, key, base, (arr) => {
        arr[index] = { ...arr[index], [field]: value };
        return arr;
      }),
    [writeList]
  );

  const addListItem = useCallback(
    (pageKey, key, base, template) =>
      writeList(pageKey, key, base, (arr) => {
        const item =
          template && typeof template === 'object'
            ? JSON.parse(JSON.stringify(template))
            : template;
        arr.push(item);
        return arr;
      }),
    [writeList]
  );

  const removeListItem = useCallback(
    (pageKey, key, base, index) =>
      writeList(pageKey, key, base, (arr) => {
        arr.splice(index, 1);
        return arr;
      }),
    [writeList]
  );

  const moveListItem = useCallback(
    (pageKey, key, base, index, dir) =>
      writeList(pageKey, key, base, (arr) => {
        const swap = index + dir;
        if (swap < 0 || swap >= arr.length) return arr;
        [arr[index], arr[swap]] = [arr[swap], arr[index]];
        return arr;
      }),
    [writeList]
  );

  /* ── Resets ─────────────────────────────────────────────────────────── */

  const resetPage = useCallback((pageKey) => {
    setOverrides((prev) => {
      if (!(pageKey in prev)) return prev;
      const next = { ...prev };
      delete next[pageKey];
      return next;
    });
    fetchedPaths.current.delete(pageKey);
    // Best-effort: also drop the row on the backend.
    pageOverridesApi.remove(pageKey).catch(() => null);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1200);
  }, []);

  const hasOverrides = useCallback(
    (pageKey) => {
      const p = overrides[pageKey];
      if (!p) return false;
      return (
        (Array.isArray(p.order) && p.order.length > 0) ||
        (p.hidden && Object.keys(p.hidden).length > 0) ||
        (p.text && Object.keys(p.text).length > 0) ||
        (p.media && Object.keys(p.media).length > 0) ||
        (p.lists && Object.keys(p.lists).length > 0)
      );
    },
    [overrides]
  );

  const value = useMemo(
    () => ({
      enabled: canEdit,
      embedded: isEmbeddedPreview(),
      editMode: canEdit && editMode,
      setEditMode,
      toggleEditMode: () => setEditMode((v) => !v),
      saveStatus,
      getLayout,
      moveSection,
      toggleHidden,
      getText,
      setText,
      getImage,
      setImage,
      getBg,
      setBg,
      getList,
      updateListItem,
      updateListField,
      addListItem,
      removeListItem,
      moveListItem,
      getListOverride,
      setListOverride,
      resetPage,
      hasOverrides,
    }),
    [
      canEdit,
      editMode,
      saveStatus,
      getLayout,
      moveSection,
      toggleHidden,
      getText,
      setText,
      getImage,
      setImage,
      getBg,
      setBg,
      getList,
      updateListItem,
      updateListField,
      addListItem,
      removeListItem,
      moveListItem,
      getListOverride,
      setListOverride,
      resetPage,
      hasOverrides,
    ]
  );

  return (
    <EditModeContext.Provider value={value}>
      {children}
      {/* Auto-edit walker — only mounts when admin + edit mode on */}
      {value.editMode ? <AutoEditWalker /> : null}
      {/* Read-side: apply text overrides for visitors AND admins (idempotent) */}
      <TextOverrideApplier overrides={overrides} />
    </EditModeContext.Provider>
  );
}

/* Headless component: watches the current path's overrides and applies any
 * `text` map entries directly to the DOM. Runs for visitors and admins both.
 * Safe to mount even alongside AutoEditWalker — applies idempotently.
 */
function TextOverrideApplier({ overrides }) {
  const location = useLocation();
  const pageKey = location.pathname;
  const blob = overrides?.[pageKey];
  useEffect(() => {
    if (!blob) return;
    // Apply once on mount and on every DOM mutation — lazy-loaded sections
    // (Hero, Stats, WhyITM, …) mount asynchronously; this catches them.
    let scheduled = 0;
    let observer = null;
    const run = () => {
      cancelAnimationFrame(scheduled);
      scheduled = requestAnimationFrame(() => {
        // Pause observation while we mutate text content, then resume —
        // otherwise our own writes would re-trigger run() forever.
        observer && observer.disconnect();
        try { applyAllOverrides(blob); } catch { /* swallow */ }
        observer && observer.observe(document.body, { childList: true, subtree: true });
      });
    };
    run();
    observer = new MutationObserver(() => run());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer && observer.disconnect();
      cancelAnimationFrame(scheduled);
    };
  }, [blob, pageKey]);
  return null;
}

export const useEditMode = () => useContext(EditModeContext);
