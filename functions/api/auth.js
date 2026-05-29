export async function onRequest(context) {
  const clientId = context.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response('GITHUB_CLIENT_ID is not configured', { status: 500 })
  }

  const url = new URL(context.request.url)
  const oauthBase = (context.env.CMS_OAUTH_BASE_URL || url.origin).replace(/\/$/, '')

  const redirectUrl = new URL('https://github.com/login/oauth/authorize')
  redirectUrl.searchParams.set('client_id', clientId)
  redirectUrl.searchParams.set('redirect_uri', `${oauthBase}/api/callback`)
  redirectUrl.searchParams.set('scope', 'repo user')

  return Response.redirect(redirectUrl.href, 302)
}
