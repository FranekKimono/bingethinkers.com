/** JSON that is safe to embed inside an inline <script>. */
function scriptJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function renderAuthRedirect(githubUrl: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <title>Redirecting to GitHub…</title>
</head>
<body>
  <p>Redirecting to GitHub…</p>
  <script>location.replace(${scriptJson(githubUrl)});</script>
</body>
</html>`
}

/**
 * Hands the OAuth result to the admin tab that opened this popup. The token is
 * only ever sent to this page's own origin: a popup opened by any other site
 * gets no reply, so it cannot collect an editor's GitHub token.
 */
export function renderCallbackPage(status: 'success' | 'error', content: unknown): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <title>Authorizing…</title>
</head>
<body>
  <p id="status">Authorizing…</p>
  <script>
(function () {
  var status = ${scriptJson(status)};
  var content = ${scriptJson(content)};
  var authMessage = 'authorization:github:' + status + ':' + JSON.stringify(content);
  var OAUTH_KEY = 'decap-oauth-pending';
  var origin = location.origin;

  function storeForAdmin() {
    try {
      localStorage.setItem(OAUTH_KEY, JSON.stringify({ status: status, content: content }));
    } catch (e) {}
    document.getElementById('status').textContent =
      'Authorization finished. Close this window and return to the admin tab.';
  }

  function receiveMessage(event) {
    if (!window.opener || event.source !== window.opener || event.origin !== origin) return;
    try {
      window.opener.postMessage(authMessage, origin);
      window.removeEventListener('message', receiveMessage, false);
      if (status === 'success') {
        setTimeout(function () { window.close(); }, 200);
      }
    } catch (e) {
      storeForAdmin();
    }
  }

  window.addEventListener('message', receiveMessage, false);

  if (window.opener) {
    try {
      window.opener.postMessage('authorizing:github', origin);
    } catch (e) {
      storeForAdmin();
    }
  } else {
    storeForAdmin();
  }
})();
  </script>
</body>
</html>`
}

export const oauthHtmlHeaders: Record<string, string> = {
  'content-type': 'text/html;charset=UTF-8',
  'cache-control': 'no-store',
  'referrer-policy': 'no-referrer',
  'x-robots-tag': 'noindex',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
}

export const OAUTH_STATE_COOKIE = 'bt_oauth_state'
