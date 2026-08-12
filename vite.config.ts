import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Public path on labs.andreaballe.com (assets must not load from domain root).
export default defineConfig({
  base: '/knowledge-lever-simulator/',
  plugins: [react()],
})
