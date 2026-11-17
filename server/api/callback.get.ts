import { renderCallbackPage, oauthHtmlHeaders, OAUTH_STATE_COOKIE } from '../utils/oauth-html'
import { getRuntimeEnv } from '../utils/runtime-env'

export default defineEventHandler(async (event) => {
  const clientId = getRuntimeEnv(event, 'GITHUB_CLIENT_ID')
  const clientSecret = getRuntimeEnv(event, 'GITHUB_CLIENT_SECRET')
  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, message: 'GitHub OAuth is not configured' })
  }

  const { code, state } = getQuery(event)
  if (!code || typeof code !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing OAuth code' })
  }

  const expectedState = getCookie(event, OAUTH_STATE_COOKIE)
  deleteCookie(event, OAUTH_STATE_COOKIE, { path: '/api/callback' })
  if (!expectedState || typeof state !== 'string' || state !== expectedState) {
    throw createError({
      statusCode: 400,
      message: 'Sign-in could not be verified. Close this window and try again from the editor.',
    })
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'bingethinkers-decap-oauth',
      accept: 'application/json',
    },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  })

  const result = (await response.json()) as {
    error?: string
    error_description?: string
    access_token?: string
  }

  for (const [key, value] of Object.entries(oauthHtmlHeaders)) {
    setResponseHeader(event, key, value)
  }

  if (result.error || !result.access_token) {
    setResponseStatus(event, 401)
    return renderCallbackPage('error', {
      error: result.error || 'no_token',
      error_description: result.error_description || 'GitHub did not return an access token.',
    })
  }

  return renderCallbackPage('success', { token: result.access_token, provider: 'github' })
})
