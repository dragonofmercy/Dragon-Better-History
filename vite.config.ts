import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import chromeManifest from './manifest.chrome.ts'
import edgeManifest from './manifest.edge.ts'

const browser = process.env.BROWSER || 'chrome'

const manifestMap: Record<string, any> = {
  chrome: chromeManifest,
  edge: edgeManifest
}

const manifest = manifestMap[browser]

export default defineConfig({
  plugins: [vue(), tailwindcss(), crx({ manifest })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        history: 'history.html'
      }
    }
  },
  server: { port: 5173, strictPort: true, hmr: { port: 5173 } }
})
