import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Optional proxy — uncomment if you hit CORS issues in dev
    // proxy: {
    //   '/api': { target: 'http://localhost:5000', changeOrigin: true }
    // }
  }
})
