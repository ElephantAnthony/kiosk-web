import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url)), fileURLToPath(new URL('../contracts', import.meta.url))] },
    proxy: {
      '/healthz': { target: process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8080' },
      '/api': { target: process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:8080' },
    },
  },
});
