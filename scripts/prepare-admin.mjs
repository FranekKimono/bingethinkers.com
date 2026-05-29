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

/** Stable branch URL, e.g. dev.bingethinkers-com.pages.dev from any deploy hash. */
function previewBranchUrl() {
  const pagesUrl = process.env.CF_PAGES_URL
  if (!pagesUrl) return null

  try {
    const url = new URL(pagesUrl)
    const hostParts = url.hostname.split('.')
    if (hostParts.length >= 3 && hostParts[hostParts.length - 2] === 'pages') {
      hostParts[0] = branch
      return `${url.protocol}//${hostParts.join('.')}`
    }
  } catch {
    /* fall through */
  }

  return null
}

function oauthBaseUrl() {
  if (branch === 'master') {
    return (process.env.CMS_OAUTH_BASE_URL || 'https://bingethinkers.com').replace(/\/$/, '')
  }

  // Preview: same-origin OAuth on the stable branch URL (not production coming-soon).
  return (
    previewBranchUrl() ||
    (process.env.CF_PAGES_URL || '').replace(/\/$/, '') ||
    (process.env.CMS_OAUTH_BASE_URL || 'https://bingethinkers.com').replace(/\/$/, '')
  )
}

const oauthBase = oauthBaseUrl()

let config = readFileSync(templatePath, 'utf8')

config = config.replace(/^(\s*branch:\s*).+$/m, `$1${branch}`)
config = config.replace(/^(\s*base_url:\s*).+$/m, `$1${oauthBase}`)

writeFileSync(configPath, config)
console.log(`[prepare-admin] CMS branch=${branch}, oauth base=${oauthBase}`)
