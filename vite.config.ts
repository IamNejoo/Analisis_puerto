import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Puerto donde corre tu backend FastAPI
        changeOrigin: true,
        secure: false,
      }
    }
  }
})