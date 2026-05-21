import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sirv from 'sirv'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = join(__dirname, 'dist')
const port = parseInt(process.env.PORT ?? '3000', 10)

const assets = sirv(dist, {
  gzip: true,
  brotli: true,
  setHeaders(res, pathname) {
    // Vite outputs content-hashed filenames under /assets/ — safe to cache forever
    if (pathname.startsWith('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    } else {
      // index.html and anything else must revalidate so new deploys take effect immediately
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    }
  },
})

// Read once at startup — avoids a disk read on every SPA fallback request
const indexHtml = readFileSync(join(dist, 'index.html'), 'utf-8')

const server = createServer((req, res) => {
  assets(req, res, () => {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    })
    res.end(indexHtml)
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on :${port}`)
})
