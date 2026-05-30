import api from './client';

// Phase 2 admin/editor visual-editor endpoints.
// Mounted server-side at /api/admin/pages.
export const adminPagesApi = {
  list: (params = {}) => api.get('/admin/pages', { params }).then((r) => r.data),
  edit: (key) => api.get(`/admin/pages/${encodeURIComponent(key)}/edit`).then((r) => r.data),
  patchMeta: (key, body) =>
    api.patch(`/admin/pages/${encodeURIComponent(key)}/meta`, body).then((r) => r.data),
  patchSection: (key, sectionKey, body, { ifMatch } = {}) =>
    api
      .patch(`/admin/pages/${encodeURIComponent(key)}/sections/${encodeURIComponent(sectionKey)}`, body, {
        headers: ifMatch ? { 'If-Match': ifMatch } : undefined,
      })
      .then((r) => r.data),
  addSection: (key, body) =>
    api.post(`/admin/pages/${encodeURIComponent(key)}/sections`, body).then((r) => r.data),
  deleteSection: (key, sectionKey, { hard = false } = {}) =>
    api.delete(`/admin/pages/${encodeURIComponent(key)}/sections/${encodeURIComponent(sectionKey)}`, {
      params: { hard },
    }),
  reorder: (key, order) =>
    api
      .patch(`/admin/pages/${encodeURIComponent(key)}/sections/reorder`, { order })
      .then((r) => r.data),
  publish: (key) => api.post(`/admin/pages/${encodeURIComponent(key)}/publish`).then((r) => r.data),
  discard: (key) => api.post(`/admin/pages/${encodeURIComponent(key)}/discard`).then((r) => r.data),
  diff: (key) => api.get(`/admin/pages/${encodeURIComponent(key)}/diff`).then((r) => r.data),
};

export const postsApi = {
  listAdmin: (params = {}) => api.get('/admin/posts', { params }).then((r) => r.data),
  get: (id) => api.get(`/admin/posts/${id}`).then((r) => r.data),
  create: (body) => api.post('/admin/posts', body).then((r) => r.data),
  update: (id, body) => api.patch(`/admin/posts/${id}`, body).then((r) => r.data),
  publish: (id) => api.post(`/admin/posts/${id}/publish`).then((r) => r.data),
  unpublish: (id) => api.post(`/admin/posts/${id}/unpublish`).then((r) => r.data),
  remove: (id, { hard = false } = {}) =>
    api.delete(`/admin/posts/${id}`, { params: { hard } }),
  listPublic: (params = {}) => api.get('/public/posts', { params }).then((r) => r.data),
  getPublic: (slug) => api.get(`/public/posts/${slug}`).then((r) => r.data),
};

export const analyticsApi = {
  summary: (range = '7d') => api.get('/admin/analytics/summary', { params: { range } }).then((r) => r.data),
  edits: (range = '7d') => api.get('/admin/analytics/edits', { params: { range } }).then((r) => r.data),
  leads: (range = '30d', group_by = 'day') =>
    api.get('/admin/analytics/leads', { params: { range, group_by } }).then((r) => r.data),
  posts: () => api.get('/admin/analytics/posts').then((r) => r.data),
};

export const scopePresetsApi = {
  list: () => api.get('/scope-presets').then((r) => r.data),
  get: (key) => api.get(`/scope-presets/${key}`).then((r) => r.data),
  create: (body) => api.post('/scope-presets', body).then((r) => r.data),
  update: (key, body) => api.patch(`/scope-presets/${key}`, body).then((r) => r.data),
  remove: (key) => api.delete(`/scope-presets/${key}`),
  applyToUser: (userId, body) =>
    api.post(`/users/${userId}/scopes/apply-preset`, body).then((r) => r.data),
};
