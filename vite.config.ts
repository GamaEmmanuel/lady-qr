import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api/analytics': {
        target: process.env.VITE_FUNCTIONS_ORIGIN || 'http://127.0.0.1:5001/lady-qr/us-central1',
        changeOrigin: true,
        secure: false,
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
