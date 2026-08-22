import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'work-1-enfulgckevggvnjv.prod-runtime.all-hands.dev',
      'work-2-enfulgckevggvnjv.prod-runtime.all-hands.dev',
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:12001',
        changeOrigin: true,
      },
    },
  },
})
