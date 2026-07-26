import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the heavy libraries out of the main bundle so first paint
        // stays fast. Charts are only reached from the dashboards.
        manualChunks: {
          motion: ['framer-motion'],
          charts: ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
