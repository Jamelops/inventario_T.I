import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import compress from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compress({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'ES2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tooltip'],
        },
      },
    },
  },
  server: {
    middlewareMode: false,
  },
});
