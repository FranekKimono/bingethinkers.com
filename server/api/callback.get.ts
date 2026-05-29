function renderBody(status: 'success' | 'error', content: unknown): string {
  return `<script>
const receiveMessage = (message) => {
  window.opener.postMessage(
    'authorization:github:${status}:${JSON.stringify(content)}',
    message.origin
  );
  window.removeEventListener("message", receiveMessage, false);
}
window.addEventListener("message", receiveMessage, false);
window.opener.postMessage("authorizing:github", "*");
</script>`
}

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
  if (result.error) {
    setResponseHeader(event, 'content-type', 'text/html;charset=UTF-8')
    setResponseStatus(event, 401)
    return renderBody('error', result)
  }

  setResponseHeader(event, 'content-type', 'text/html;charset=UTF-8')
  return renderBody('success', { token: result.access_token, provider: 'github' })
})
