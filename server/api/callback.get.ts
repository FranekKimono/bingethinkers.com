function renderBody(status: 'success' | 'error', content: unknown): string {
  const payload = JSON.stringify(content)
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Authorizing…</title>
</head>
<body>
  <p>Authorizing… You can close this window if it does not close automatically.</p>
  <script>
(function () {
  var status = ${JSON.stringify(status)};
  var payload = ${JSON.stringify(payload)};
  var message = 'authorization:github:' + status + ':' + payload;
  var delivered = false;

  function deliver(origin) {
    if (!window.opener || delivered) return;
    try {
      window.opener.postMessage(message, origin || '*');
      delivered = true;
      if (status === 'success') {
        setTimeout(function () { window.close(); }, 200);
      }
    } catch (err) {
      console.error('OAuth callback failed to notify opener', err);
    }
  }

  function onMessage(event) {
    deliver(event.origin);
    window.removeEventListener('message', onMessage, false);
  }

  window.addEventListener('message', onMessage, false);

  if (window.opener) {
    window.opener.postMessage('authorizing:github', '*');
  } else {
    document.body.innerHTML = '<p>Authorization finished. Return to the admin tab.</p>';
  }
})();
  </script>
</body>
</html>`
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

  const url = getRequestURL(event)
  const oauthBase = (process.env.CMS_OAUTH_BASE_URL || url.origin).replace(/\/$/, '')

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
  setResponseHeader(event, 'Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  setResponseHeader(event, 'Cross-Origin-Embedder-Policy', 'unsafe-none')
  return renderBody('success', { token: result.access_token, provider: 'github' })
})
