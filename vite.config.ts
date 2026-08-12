import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/** Stylesheets with crossorigin use CORS mode; a poisoned CDN entry was
 *  serving index.html for that variant. Same-origin CSS does not need it. */
function stripStylesheetCrossorigin(): Plugin {
  return {
    name: 'strip-stylesheet-crossorigin',
    transformIndexHtml(html) {
      return html.replace(
        /(<link\b[^>]*\brel=["']stylesheet["'][^>]*)\s+crossorigin(?:="[^"]*")?/gi,
        '$1',
      )
    },
  }
}

// Public path on labs.andreaballe.com (assets must not load from domain root).
export default defineConfig({
  base: '/knowledge-lever-simulator/',
  plugins: [react(), stripStylesheetCrossorigin()],
})
