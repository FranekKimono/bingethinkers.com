/**
 * Writes public/admin/config.yml before build from the template.
 * Cloudflare Pages sets CF_PAGES_BRANCH (e.g. master = production, dev = preview).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const adminDir = join('public', 'admin')
const templatePath = join(adminDir, 'config.yml.template')
const configPath = join(adminDir, 'config.yml')
const branch = process.env.CF_PAGES_BRANCH || 'master'
// Decap checks postMessage origin against base_url. OAuth runs on production domain
// (even from preview admin) so one GitHub callback URL works: bingethinkers.com/api/callback
const oauthBase = (process.env.CMS_OAUTH_BASE_URL || 'https://bingethinkers.com').replace(/\/$/, '')

let config = readFileSync(templatePath, 'utf8')

config = config.replace(/^(\s*branch:\s*).+$/m, `$1${branch}`)
config = config.replace(/^(\s*base_url:\s*).+$/m, `$1${oauthBase}`)

writeFileSync(configPath, config)
console.log(`[prepare-admin] CMS branch=${branch}, oauth base=${oauthBase}`)
