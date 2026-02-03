import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => {
          // Convertir /api/admin/login -> /.netlify/functions/admin/login
          return path.replace(/^\/api/, '/.netlify/functions')
        },
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.log('⚠️  Proxy error:', err.message)
            console.log('💡 Ejecuta: netlify dev (en otra terminal)')
          })
        },
      },
    },
  },
})
