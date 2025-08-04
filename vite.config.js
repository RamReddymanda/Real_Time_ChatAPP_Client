import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
  erver: {
    host: '0.0.0.0',
    port: 5173
  },
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({ protocolImports: true }), // ✅ Add this
  ],
  define: {
    global: 'globalThis', // ✅ Needed for browser-based Node shims
  },
  resolve: {
    alias: {
      stream: 'rollup-plugin-node-polyfills/polyfills/stream',
      events: 'rollup-plugin-node-polyfills/polyfills/events',
      util: 'rollup-plugin-node-polyfills/polyfills/util',
      buffer: 'rollup-plugin-node-polyfills/polyfills/buffer-es6',
      process: 'rollup-plugin-node-polyfills/polyfills/process-es6',
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'events', 'util'],
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
    },
  },
});
