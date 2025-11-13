import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// Requirement 15.5: Configure Vite build optimizations
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Requirement 15.3: Code splitting for optimal bundle sizes
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
          'ui-components': [
            '@radix-ui/react-label',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slot',
            'lucide-react',
          ],
        },
      },
    },
    // Requirement 15.5: Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Enable minification for production
    minify: 'esbuild',
    // Source maps for debugging (disable in production for smaller bundles)
    sourcemap: false,
  },
  // Requirement 15.1: Optimize for First Contentful Paint
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
  },
})
