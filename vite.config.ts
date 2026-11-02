import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    port: 5173,
    // During development, requests to /api/* are forwarded to
    // the backend on :3000. The browser sees one origin → no
    // CORS setup needed and cookies work as in production.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: true,
  },
  test: {
    // fake DOM for component tests
    environment: 'jsdom',
    // runs before every test file (matchers, MSW)
    setupFiles: './src/test/setup.ts',
    // describe/it/expect without imports
    globals: true,
  },
});