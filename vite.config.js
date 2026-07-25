import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // `terser` is not installed. OXC is Vite 8's built-in production
    // minifier, so deployments can regenerate the bundle containing the
    // corrected story paths without an additional package.
    minify: 'oxc',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vite 8 uses Rolldown, which accepts a function here (rather than
        // Rollup's object form). Normalising separators makes this work on
        // Windows development machines and POSIX build runners.
        manualChunks(id) {
          const modulePath = id.replaceAll('\\', '/')

          if (modulePath.includes('/node_modules/@supabase/')) return 'supabase'
          if (
            modulePath.includes('/node_modules/framer-motion/') ||
            modulePath.includes('/node_modules/react-hot-toast/')
          ) return 'ui'
          if (
            modulePath.includes('/node_modules/react/') ||
            modulePath.includes('/node_modules/react-dom/') ||
            modulePath.includes('/node_modules/react-router-dom/')
          ) return 'vendor'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src',
    }
  }
})
