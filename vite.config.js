import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createLabApi } from './server/api.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ['LAB_', 'AIHOT_']), ...process.env }
  const attachApi = (server) => {
    const api = createLabApi(env)
    server.middlewares.use((req, res, next) => {
      if (/^\/workbench\/?(?:\?|$)/.test(req.url)) res.setHeader('X-Robots-Tag', 'noindex, nofollow')
      return api(req, res, next)
    })
  }
  return {
    plugins: [react(), { name: 'lulu-lab-api', configureServer: attachApi, configurePreviewServer: attachApi }],
    build: { chunkSizeWarningLimit: 900 },
  }
})
