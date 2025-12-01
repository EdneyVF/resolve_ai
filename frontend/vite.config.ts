import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {

      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001', // URL do backend
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  define: {
    'process.env': {}
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },

  base: '/',

  publicDir: 'public'
})
