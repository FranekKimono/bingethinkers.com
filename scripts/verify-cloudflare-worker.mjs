/**
 * Prevent a static-only or OAuth-only deployment from silently replacing the
 * Nuxt worker. The contact form and CMS OAuth routes must ship together.
 */
import { existsSync } from 'node:fs'

const requiredFiles = [
  'dist/_worker.js/index.js',
  'dist/_worker.js/chunks/routes/api/auth.get.mjs',
  'dist/_worker.js/chunks/routes/api/callback.get.mjs',
  'dist/_worker.js/chunks/routes/api/contact.post.mjs',
  'dist/_worker.js/chunks/routes/api/instagram.get.mjs',
]

const missingFiles = requiredFiles.filter((path) => !existsSync(path))

if (missingFiles.length > 0) {
  console.error('[verify-cloudflare-worker] Full Nuxt worker is missing required files:')
  for (const path of missingFiles) console.error(`  - ${path}`)
  console.error('Build with the cloudflare-pages Nitro preset; refusing a broken deployment.')
  process.exit(1)
}

console.log('[verify-cloudflare-worker] Nuxt worker contains the contact and OAuth routes')
