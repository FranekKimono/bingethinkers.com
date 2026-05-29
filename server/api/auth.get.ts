export default defineEventHandler((event) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    throw createError({ statusCode: 500, message: 'GITHUB_CLIENT_ID is not configured' })
  }

  const url = getRequestURL(event)
  const oauthBase = (process.env.CMS_OAUTH_BASE_URL || url.origin).replace(/\/$/, '')
  const redirectUrl = new URL('https://github.com/login/oauth/authorize')
  redirectUrl.searchParams.set('client_id', clientId)
  redirectUrl.searchParams.set('redirect_uri', `${oauthBase}/api/callback`)
  redirectUrl.searchParams.set('scope', 'repo user')
  redirectUrl.searchParams.set('state', crypto.randomUUID())

  setResponseHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  setResponseHeader(event, 'Cross-Origin-Embedder-Policy', 'unsafe-none')
  return sendRedirect(event, redirectUrl.href, 302)
})
