import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy /api requests to the backend during development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
