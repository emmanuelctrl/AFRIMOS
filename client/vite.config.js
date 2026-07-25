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
        // Keep the heavy 3D/animation libraries out of the main bundle so the
        // first paint stays fast; the hero scene is imported lazily.
        manualChunks: {
          three: ['three'],
          drei: ['@react-three/fiber', '@react-three/drei'],
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
