import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import inject from '@rollup/plugin-inject';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      protocolImports: true, // ✅ Enables `node:` imports in the browser
    }),
  ],
  define: {
    global: 'globalThis', // ✅ Makes Node globals work in browser
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      events: 'events/',
      util: 'util/',
      buffer: 'buffer/',
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process',
      'events',
      'util',
      'stream',
    ],
  },
  build: {
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        }),
      ],
    },
  },
});
