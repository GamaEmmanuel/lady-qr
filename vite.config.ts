import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api/analytics': {
        target: process.env.VITE_FUNCTIONS_ORIGIN || 'https://us-central1-lady-qr.cloudfunctions.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/analytics/, '/getAnalytics')
      }
    }
  },
  preview: {
    port: 8080,
    host: '0.0.0.0',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
