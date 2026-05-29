/**
 * Ensures /api/auth and /api/callback invoke Cloudflare Pages Functions.
 *
 * On the master coming-soon deploy there is no Nuxt worker — without this file,
 * /api/auth serves index.html. The popup then shows a broken image because
 * coming-soon.jpg resolves relative to /api/ → /api/coming-soon.jpg (404).
 */
import { existsSync, writeFileSync } from 'node:fs'

const routesPath = 'dist/_routes.json'

if (existsSync(routesPath)) {
  console.log('[patch-oauth-routes] dist/_routes.json already exists (Nuxt preview) — skipping')
  process.exit(0)
}

writeFileSync(
  routesPath,
  `${JSON.stringify({ version: 1, include: ['/api/*'] }, null, 2)}\n`,
)
console.log('[patch-oauth-routes] Created dist/_routes.json (OAuth only)')
