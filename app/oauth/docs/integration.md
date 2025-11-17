## Integration Steps

1. Generate a unique `state` value in the third-party app and persist it in `sessionStorage` to validate the callback:

```ts
const state = crypto.randomUUID()
sessionStorage.setItem('oauth_state', state)
```

2. Build the login URL with the whitelisted `redirectUrl` and `state`, then redirect the browser:

```ts
const loginUrl = `https://your-2fa-domain.com/login?redirectUrl=${encodeURIComponent(callbackUrl)}&state=${state}`
window.location.href = loginUrl
```

3. After 2FA succeeds, we redirect back to your `redirectUrl` with `token` and `state` query parameters:

```ts
const params = new URLSearchParams(window.location.search)
const token = params.get('token')
const returnedState = params.get('state')
```

4. Validate the `state`, call `/api/auth/verify` to check the token, then create your own session:

```ts
if (returnedState !== sessionStorage.getItem('oauth_state')) {
  throw new Error('Invalid state')
}

sessionStorage.removeItem('oauth_state')

const res = await fetch('https://your-2fa-domain.com/api/auth/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
})
```

5. Once verification passes, exchange the short-lived token (default TTL: 5 minutes) for your own long-term session or access token.
