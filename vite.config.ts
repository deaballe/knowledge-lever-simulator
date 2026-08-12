import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the same build works under any runtime BASE_PATH.
export default defineConfig({
  base: './',
  plugins: [react()],
})
