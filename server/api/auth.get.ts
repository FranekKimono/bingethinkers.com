import { renderAuthRedirect, oauthHtmlHeaders, OAUTH_STATE_COOKIE } from '../utils/oauth-html'
import { getRuntimeEnv } from '../utils/runtime-env'

export default defineEventHandler((event) => {
  const clientId = getRuntimeEnv(event, 'GITHUB_CLIENT_ID')
  if (!clientId) {
    throw createError({ statusCode: 500, message: 'GITHUB_CLIENT_ID is not configured' })
  }

  const url = getRequestURL(event)
  const oauthBase = (getRuntimeEnv(event, 'CMS_OAUTH_BASE_URL') || url.origin).replace(/\/$/, '')

  // CSRF protection: the callback only accepts the state this browser was given.
  const state = crypto.randomUUID()
  setCookie(event, OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: url.protocol === 'https:',
    sameSite: 'lax',
    path: '/api/callback',
    maxAge: 600,
  })

  const redirectUrl = new URL('https://github.com/login/oauth/authorize')
  redirectUrl.searchParams.set('client_id', clientId)
  redirectUrl.searchParams.set('redirect_uri', `${oauthBase}/api/callback`)
  redirectUrl.searchParams.set('scope', 'repo')
  redirectUrl.searchParams.set('state', state)

  for (const [key, value] of Object.entries(oauthHtmlHeaders)) {
    setResponseHeader(event, key, value)
  }
  return renderAuthRedirect(redirectUrl.href)
})
