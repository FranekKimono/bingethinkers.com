/** Ensures server API routes are handled by _worker.js, not static assets. */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const routesPath = 'dist/_routes.json'
const apiPaths = ['/api/auth', '/api/callback', '/api/contact', '/api/instagram']

if (!existsSync(routesPath)) {
  writeFileSync(
    routesPath,
    `${JSON.stringify({ version: 1, include: ['/api/*'] }, null, 2)}\n`,
  )
  console.log('[patch-oauth-routes] Created dist/_routes.json for API routes')
  process.exit(0)
}

const routes = JSON.parse(readFileSync(routesPath, 'utf8'))
const exclude = new Set(routes.exclude || [])

for (const path of apiPaths) {
  exclude.delete(path)
}

routes.exclude = [...exclude]
writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`)
console.log('[patch-oauth-routes] Ensured API paths invoke _worker.js')
