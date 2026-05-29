/** Shared HTML snippets for Decap CMS GitHub OAuth (build-time worker generation). */

export function renderAuthRedirect(githubUrl) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Redirecting to GitHub…</title>
</head>
<body>
  <p>Redirecting to GitHub…</p>
  <script>location.replace(${JSON.stringify(githubUrl)});</script>
</body>
</html>`
}

export function renderCallbackPage(status, content) {
  const contentJson = JSON.stringify(content)
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Authorizing…</title>
</head>
<body>
  <p id="status">Authorizing…</p>
  <script>
(function () {
  var status = ${JSON.stringify(status)};
  var content = ${contentJson};
  var authMessage = 'authorization:github:' + status + ':' + JSON.stringify(content);
  var OAUTH_KEY = 'decap-oauth-pending';

  function storeForAdmin() {
    try {
      localStorage.setItem(OAUTH_KEY, JSON.stringify({ status: status, content: content }));
    } catch (e) {}
    document.getElementById('status').textContent =
      'Authorization finished. Close this window and return to the admin tab.';
  }

  function receiveMessage(event) {
    if (!window.opener) return;
    try {
      window.opener.postMessage(authMessage, event.origin);
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
      window.opener.postMessage('authorizing:github', '*');
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

export const oauthHtmlHeaders = {
  'content-type': 'text/html;charset=UTF-8',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
}
