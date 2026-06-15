// Крок 2 OAuth: обмін code на токен і передача його в адмінку через postMessage.
function page(status, payload) {
  const data = JSON.stringify(payload);
  return `<!doctype html><html><head><meta charset="utf-8"></head><body>
<script>
(function () {
  function receiveMessage(e) {
    window.opener.postMessage('authorization:github:${status}:${data}', e.origin);
    window.removeEventListener('message', receiveMessage, false);
  }
  window.addEventListener('message', receiveMessage, false);
  if (window.opener) {
    window.opener.postMessage('authorizing:github', '*');
  } else {
    document.body.textContent = '${status === 'success' ? 'Готово. Можна закрити вікно.' : 'Помилка авторизації.'}';
  }
})();
</script>
</body></html>`;
}

export default async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const url = new URL(req.url, 'http://localhost');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookies = (req.headers.cookie || '').split(';').map((c) => c.trim());
  const savedState = (cookies.find((c) => c.startsWith('oauth_state=')) || '').split('=')[1];

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  if (!clientId || !clientSecret) {
    res.statusCode = 500;
    res.end(page('error', { error: 'GitHub OAuth не налаштовано' }));
    return;
  }
  if (!code || !state || state !== savedState) {
    res.statusCode = 400;
    res.end(page('error', { error: 'Invalid state' }));
    return;
  }
  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const data = await tokenRes.json();
    if (data.access_token) {
      res.statusCode = 200;
      res.end(page('success', { token: data.access_token, provider: 'github' }));
    } else {
      res.statusCode = 401;
      res.end(page('error', { error: data.error_description || data.error || 'Не вдалося отримати токен' }));
    }
  } catch (e) {
    res.statusCode = 500;
    res.end(page('error', { error: String(e) }));
  }
}
