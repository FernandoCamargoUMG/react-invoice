import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/importadora/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://novacodefc.com/invoice',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})
