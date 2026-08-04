import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Three/R3F are lazy-loaded as one cached vendor chunk; their compressed size
  // remains ~234 KB while the initial application bundle stays below 120 KB.
  build: {
    chunkSizeWarningLimit: 900,
  },
})
