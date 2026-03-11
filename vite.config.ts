import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

function serveDataDir() {
  return {
    name: 'serve-data-dir',
    configureServer(server: { middlewares: { use: Function } }) {
      server.middlewares.use('/data', (req: { url?: string }, res: { writeHead: Function; end: Function }, next: Function) => {
        const filePath = path.join(__dirname, 'data', req.url || '')
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
          res.end(fs.readFileSync(filePath, 'utf-8'))
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serveDataDir()],
})
