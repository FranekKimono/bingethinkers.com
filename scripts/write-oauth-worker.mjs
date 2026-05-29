/**
 * Writes dist/_worker.js for Decap CMS GitHub OAuth on Cloudflare Pages.
 * Workers receive dashboard env vars via the `env` argument (unlike Pages Functions
 * in some preview setups, where context.env can be empty even when vars are set).
 */
import { writeFileSync } from 'node:fs'

const worker = `export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (url.pathname === '/api/auth') {
      return handleAuth(url, env)
    }

    if (url.pathname === '/api/callback') {
      return handleCallback(url, env)
    }

    return env.ASSETS.fetch(request)
  },
}

function oauthBase(url, env) {
  return (env.CMS_OAUTH_BASE_URL || url.origin).replace(/\\/$/, '')
}

function handleAuth(url, env) {
  const clientId = env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response(
      'GITHUB_CLIENT_ID is not configured. In Cloudflare Pages → Settings → Environment variables, add GITHUB_CLIENT_ID for Preview (and Production). Then redeploy.',
      { status: 500 },
    )
  }

  const base = oauthBase(url, env)
  const redirectUrl = new URL('https://github.com/login/oauth/authorize')
  redirectUrl.searchParams.set('client_id', clientId)
  redirectUrl.searchParams.set('redirect_uri', base + '/api/callback')
  redirectUrl.searchParams.set('scope', 'repo user')

  return Response.redirect(redirectUrl.href, 302)
}

function renderCallbackBody(status, content) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Authorizing…</title></head><body><script>\\n' +
    '(function(){\\n' +
    '  var status=' + JSON.stringify(status) + ';\\n' +
    '  var payload=' + JSON.stringify(JSON.stringify(content)) + ';\\n' +
    '  var message="authorization:github:"+status+":"+payload;\\n' +
    '  function deliver(origin){if(!window.opener||delivered)return;try{window.opener.postMessage(message,origin||"*");delivered=true;if(status==="success")setTimeout(function(){window.close()},200)}catch(e){}}\\n' +
    '  var delivered=false;\\n' +
    '  window.addEventListener("message",function(e){deliver(e.origin);window.removeEventListener("message",arguments.callee,false)},false);\\n' +
    '  if(window.opener){window.opener.postMessage("authorizing:github","*")}else{document.body.innerHTML="<p>Authorization finished. Return to the admin tab.</p>"}\\n' +
    '})();\\n' +
    '</script></body></html>'
}

async function handleCallback(url, env) {
  const clientId = env.GITHUB_CLIENT_ID
  const clientSecret = env.GITHUB_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth is not configured', { status: 500 })
  }

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
      return new Response(renderCallbackBody('error', result), {
        status: 401,
        headers: { 'content-type': 'text/html;charset=UTF-8' },
      })
    }

    return new Response(
      renderCallbackBody('success', { token: result.access_token, provider: 'github' }),
      {
        status: 200,
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
          'Cross-Origin-Embedder-Policy': 'unsafe-none',
        },
      },
    )
  } catch (error) {
    return new Response(String(error), { status: 500 })
  }
}
`

writeFileSync('dist/_worker.js', worker)
console.log('[write-oauth-worker] Wrote dist/_worker.js')
