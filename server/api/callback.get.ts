import { renderCallbackPage, oauthHtmlHeaders } from '../utils/oauth-html'

export default defineEventHandler(async (event) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw createError({ statusCode: 500, message: 'GitHub OAuth is not configured' })
  }

  const code = getQuery(event).code
  if (!code || typeof code !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing OAuth code' })
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

  const result = await response.json()

  for (const [key, value] of Object.entries(oauthHtmlHeaders)) {
    setResponseHeader(event, key, value)
  }

  if (result.error) {
    setResponseStatus(event, 401)
    return renderCallbackPage('error', result)
  }

  return renderCallbackPage('success', { token: result.access_token, provider: 'github' })
})
