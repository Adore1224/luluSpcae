import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, readdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { createLabApi } from './server/api.js'

const require = createRequire(import.meta.url)
const pdfPackage = require.resolve('pdfjs-dist/package.json')
const pdfAssets = `assets/pdfjs-${require(pdfPackage).version}`
const pdfDirectories = ['cmaps', 'standard_fonts', 'iccs', 'wasm']

function pdfResources() {
  return {
    name: 'pdf-resources',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const prefix = '/' + pdfAssets + '/'
        if (req.url.startsWith(prefix)) {
          const [directory, file, extra] = req.url.slice(prefix.length).split('/')
          if (pdfDirectories.includes(directory) && /^[\w-][\w.-]*$/.test(file) && extra === undefined) {
            req.url = '/node_modules/pdfjs-dist/' + directory + '/' + file
          }
        }
        next()
      })
    },
    generateBundle() {
      for (const directory of pdfDirectories) {
        const source = join(dirname(pdfPackage), directory)
        for (const file of readdirSync(source, { withFileTypes: true })) {
          if (!file.isFile()) continue
          this.emitFile({ type: 'asset', fileName: `${pdfAssets}/${directory}/${file.name}`, source: readFileSync(join(source, file.name)) })
        }
      }
    },
  }
}

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
    plugins: [react(), pdfResources(), { name: 'lulu-lab-api', configureServer: attachApi, configurePreviewServer: attachApi }],
    build: { chunkSizeWarningLimit: 900 },
  }
})
