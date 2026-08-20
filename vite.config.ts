import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Builds the embed-loadable bundle that the host Amplenote iframe loads.
// Output: sandbox/plugin/plugin.iife.js  — single, side-effect only.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'sandbox/plugin'),
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/embed-entry.tsx'),
      formats: ['iife'],
      name: 'AMK',
      fileName: () => 'plugin.iife.js',
    },
    rollupOptions: {
      // Bundle every dep — victims of the Amplenote plugin sandbox.
      external: [],
    },
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
