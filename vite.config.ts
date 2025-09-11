import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api/voltage': {
        target: 'https://voltageapi.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/voltage/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    }
  }
})
