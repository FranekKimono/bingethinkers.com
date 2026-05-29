/**
 * Patches public/admin/config.yml before build.
 * Cloudflare Pages sets CF_PAGES_BRANCH (e.g. master = production, dev = preview).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const configPath = join('public', 'admin', 'config.yml')
const branch = process.env.CF_PAGES_BRANCH || 'master'
const oauthBase = process.env.CMS_OAUTH_BASE_URL || 'https://bingethinkers.com'

let config = readFileSync(configPath, 'utf8')

config = config.replace(/^(\s*branch:\s*).+$/m, `$1${branch}`)
config = config.replace(/^(\s*base_url:\s*).+$/m, `$1${oauthBase}`)

writeFileSync(configPath, config)
console.log(`[prepare-admin] CMS branch=${branch}, oauth base=${oauthBase}`)
