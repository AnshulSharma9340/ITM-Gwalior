import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All /api/* and /uploads/* calls are forwarded to the FastAPI backend
      '/api': 'http://localhost:8000',
      '/uploads': 'http://localhost:8000',
      // AI Agent API - handled by main backend (port 8000) via /api/ai/*
      // Pretty URLs for crawlers — proxied to the dynamic endpoints
      '/sitemap.xml': {
        target: 'http://localhost:8000',
        rewrite: () => '/api/public/sitemap.xml',
      },
      '/robots.txt': {
        target: 'http://localhost:8000',
        rewrite: () => '/api/public/robots.txt',
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          query: ['@tanstack/react-query'],
          icons: ['lucide-react', 'react-icons'],
          // anything under pages/admin/ becomes its own chunk
          admin: [
            './src/pages/admin/AdminUsers.jsx',
            './src/pages/admin/AdminSettings.jsx',
            './src/pages/admin/AdminPages.jsx',
            './src/pages/admin/AdminMedia.jsx',
            './src/pages/admin/AdminDepartments.jsx',
            './src/pages/admin/AdminPlacements.jsx',
            './src/pages/admin/AdminResearch.jsx',
            './src/pages/admin/AdminEvents.jsx',
            './src/pages/admin/AdminGallery.jsx',
            './src/pages/admin/AdminLeads.jsx',
            './src/pages/admin/AdminCompliance.jsx',
          ],
        },
      },
    },
  },
})
