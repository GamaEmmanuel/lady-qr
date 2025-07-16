import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const PORT = parseInt(process.env.PORT || '8080', 10);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: PORT,
    host: '0.0.0.0',
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
