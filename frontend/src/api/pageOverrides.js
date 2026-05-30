import api from './client';

/* Persistence layer for the in-place visual editor.
 *
 * One JSON blob per public route, stored in the `settings` table on the
 * backend under key `page_overrides:{path}`. Reads are public so visitors
 * see the latest published edits; writes require `site.pages` scope.
 *
 * Endpoints exposed:
 *   GET    /api/public/page-overrides/{path}    public, cached 30s
 *   GET    /api/admin/page-overrides/{path}     authed
 *   PUT    /api/admin/page-overrides/{path}     authed + site.pages
 *   DELETE /api/admin/page-overrides/{path}     authed + site.pages
 */
function normalisePath(path) {
  if (!path) return '/';
  let p = path.startsWith('/') ? path : `/${path}`;
  // strip trailing slash except for root
  if (p.length > 1 && p.endsWith('/')) p = p.replace(/\/+$/, '');
  return p;
}

export const pageOverridesApi = {
  publicGet(path) {
    return api
      .get(`/public/page-overrides${normalisePath(path)}`)
      .then((r) => r.data.overrides || {});
  },
  adminGet(path) {
    return api
      .get(`/admin/page-overrides${normalisePath(path)}`)
      .then((r) => r.data.overrides || {});
  },
  put(path, overrides) {
    return api
      .put(`/admin/page-overrides${normalisePath(path)}`, overrides)
      .then((r) => r.data.overrides || {});
  },
  remove(path) {
    return api.delete(`/admin/page-overrides${normalisePath(path)}`);
  },
};
