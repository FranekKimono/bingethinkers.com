/**
 * Ensures /api/auth and /api/callback are handled by _worker.js, not static assets.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const routesPath = 'dist/_routes.json'
const oauthPaths = ['/api/auth', '/api/callback']

if (!existsSync(routesPath)) {
  writeFileSync(
    routesPath,
    `${JSON.stringify({ version: 1, include: ['/api/*'] }, null, 2)}\n`,
  )
  console.log('[patch-oauth-routes] Created dist/_routes.json (OAuth only)')
  process.exit(0)
}

const routes = JSON.parse(readFileSync(routesPath, 'utf8'))
const exclude = new Set(routes.exclude || [])

for (const path of oauthPaths) {
  exclude.delete(path)
}

routes.exclude = [...exclude]
writeFileSync(routesPath, `${JSON.stringify(routes, null, 2)}\n`)
console.log('[patch-oauth-routes] Ensured OAuth paths invoke _worker.js')
