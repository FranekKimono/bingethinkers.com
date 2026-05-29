function renderBody(status, content) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Authorizing…</title></head>
<body>
<script>
(function () {
  var receiveMessage = function (message) {
    window.opener.postMessage(
      'authorization:github:${status}:${JSON.stringify(content)}',
      message.origin
    );
    window.removeEventListener('message', receiveMessage, false);
  };
  window.addEventListener('message', receiveMessage, false);
  window.opener.postMessage('authorizing:github', '*');
})();
</script>
</body>
</html>`
}

export async function onRequest(context) {
  const clientId = context.env.GITHUB_CLIENT_ID
  const clientSecret = context.env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth is not configured', { status: 500 })
  }

  const url = new URL(context.request.url)
  const code = url.searchParams.get('code')
  if (!code) {
    return new Response('Missing OAuth code', { status: 400 })
  }

  try {
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
      return new Response(renderBody('error', result), {
        headers: { 'content-type': 'text/html;charset=UTF-8' },
        status: 401,
      })
    }

    return new Response(renderBody('success', { token: result.access_token, provider: 'github' }), {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
      status: 200,
    })
  } catch (error) {
    return new Response(String(error), { status: 500 })
  }
}
