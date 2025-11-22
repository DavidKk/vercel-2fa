# OAuth Integration Guide

This guide explains how to integrate the ECDH-encrypted OAuth flow into your application using the provided React hooks and utilities.

## Quick Start

The easiest way to integrate OAuth is using the `OAuthFlowProvider` and `useOAuthFlowContext` hooks:

```tsx
import { OAuthFlowProvider, useOAuthFlowContext } from '@/services/oauth/client'

function LoginButton() {
  const { startLogin, status, result, error } = useOAuthFlowContext()

  const handleLogin = async () => {
    try {
      await startLogin({
        redirectUrl: window.location.origin + '/callback',
      })
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <button onClick={handleLogin} disabled={status === 'launching'}>
      {status === 'launching' ? 'Starting...' : 'Login with 2FA'}
    </button>
  )
}

function App() {
  return (
    <OAuthFlowProvider>
      <LoginButton />
    </OAuthFlowProvider>
  )
}
```

## Advanced Usage

### Custom Configuration

```tsx
import { OAuthFlowProvider } from '@/services/oauth/client'

function App() {
  return (
    <OAuthFlowProvider
      providerUrl="/oauth" // Default: '/oauth'
      defaultMode="popup" // Default: 'popup' (or 'redirect')
    >
      <YourApp />
    </OAuthFlowProvider>
  )
}
```

### Handling OAuth Results

```tsx
import { useOAuthFlowContext } from '@/services/oauth/client'

function OAuthCallback() {
  const { status, result, error } = useOAuthFlowContext()

  useEffect(() => {
    if (status === 'success' && result) {
      // result contains:
      // - access_token: string
      // - token_type: 'Bearer'
      // - expires_in: number (seconds)
      // - user: { sub?: string, authenticated?: boolean }
      // - claims?: JwtPayload

      // Store the access token and create your session
      localStorage.setItem('access_token', result.access_token)

      // Redirect to your app's authenticated area
      window.location.href = '/dashboard'
    }
  }, [status, result])

  if (status === 'error') {
    return <div>Error: {error}</div>
  }

  if (status === 'processing') {
    return <div>Processing OAuth callback...</div>
  }

  return null
}
```

## Flow Modes

### Popup Mode (Default)

Popup mode uses `window.open()` to open authentication in a popup window. The token is delivered via `postMessage` API.

**Advantages:**

- Tokens never appear in URL
- Better UX: no page navigation
- More secure: no browser history exposure

**Usage:**

```tsx
<OAuthFlowProvider defaultMode="popup">
  <YourApp />
</OAuthFlowProvider>
```

### Redirect Mode

Redirect mode uses `window.location.href` for full-page redirect. The token is delivered via URL hash (`#token=...&state=...`).

**Advantages:**

- Works in all browsers and scenarios
- More compatible with strict popup blockers
- Hash parameters are not sent to server

**Usage:**

```tsx
<OAuthFlowProvider defaultMode="redirect">
  <YourApp />
</OAuthFlowProvider>
```

## Manual Integration (Without Hooks)

If you prefer to implement the flow manually without using the provided hooks:

### 1. Fetch Server Public Key

```ts
async function fetchServerPublicKey(): Promise<string> {
  const response = await fetch('https://your-2fa-domain.com/api/oauth/public-key', {
    method: 'GET',
    headers: {
      Origin: window.location.origin,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch server public key')
  }

  const data = await response.json()
  return data.publicKey
}
```

### 2. Generate ECDH Key Pair

```ts
import { generateECDHKeyPair, exportPublicKey, exportPrivateKey } from '@/utils/ecdh-client'

// For popup mode: store in memory
const keyPair = await generateECDHKeyPair()
const publicKeyBase64 = await exportPublicKey(keyPair)
const privateKeyBase64 = await exportPrivateKey(keyPair)

// For redirect mode: store in sessionStorage
sessionStorage.setItem('oauth_client_public_key', publicKeyBase64)
sessionStorage.setItem('oauth_client_private_key', privateKeyBase64)
```

### 3. Build Login URL

```ts
function buildLoginUrl(redirectUrl: string, mode: 'popup' | 'redirect'): string {
  const state = crypto.randomUUID()
  const loginUrl = new URL('https://your-2fa-domain.com/oauth', window.location.origin)

  // Add mode parameter to redirect URL
  const redirectUrlWithMode = new URL(redirectUrl, window.location.origin)
  redirectUrlWithMode.searchParams.set('mode', mode)

  loginUrl.searchParams.set('redirectUrl', encodeURIComponent(redirectUrlWithMode.toString()))
  loginUrl.searchParams.set('state', state)
  loginUrl.searchParams.set('clientPublicKey', publicKeyBase64)

  if (mode === 'popup') {
    loginUrl.searchParams.set('callbackOrigin', window.location.origin)
  }

  // Store state for validation
  if (mode === 'popup') {
    // Store in memory
    memoryStateRef.current = state
  } else {
    // Store in sessionStorage
    sessionStorage.setItem('oauth_state', state)
  }

  return loginUrl.toString()
}
```

### 4. Handle Popup Mode Callback

```ts
// Register postMessage listener
window.addEventListener('message', async (event) => {
  // Validate origin
  if (event.origin !== 'https://your-2fa-domain.com') {
    return
  }

  // Validate message type
  if (event.data.type !== 'OAUTH_RESULT') {
    return
  }

  // Validate state
  if (event.data.state !== memoryStateRef.current) {
    throw new Error('Invalid state')
  }

  // Decrypt token
  const encryptedToken = event.data.encryptedToken
  const decryptedToken = await decryptToken(
    encryptedToken,
    privateKeyBase64, // from memory
    serverPublicKey
  )

  // Verify token
  const response = await fetch('https://your-2fa-domain.com/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: window.location.origin,
    },
    body: JSON.stringify({ token: decryptedToken }),
  })

  const data = await response.json()
  // Use data.access_token to create your session
})
```

### 5. Handle Redirect Mode Callback

```ts
// On your callback page
function handleRedirectCallback() {
  // Read from URL hash (more secure than query params)
  const hash = window.location.hash.substring(1)
  const hashParams = new URLSearchParams(hash)
  const token = hashParams.get('token')
  const state = hashParams.get('state')

  // Validate state
  const storedState = sessionStorage.getItem('oauth_state')
  if (state !== storedState) {
    throw new Error('Invalid state')
  }

  // Load private key from sessionStorage
  const privateKeyBase64 = sessionStorage.getItem('oauth_client_private_key')
  if (!privateKeyBase64) {
    throw new Error('Private key not found')
  }

  // Decrypt token
  const decryptedToken = await decryptToken(token!, privateKeyBase64, serverPublicKey)

  // Verify token
  const response = await fetch('https://your-2fa-domain.com/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: window.location.origin,
    },
    body: JSON.stringify({ token: decryptedToken }),
  })

  const data = await response.json()

  // Cleanup
  sessionStorage.removeItem('oauth_state')
  sessionStorage.removeItem('oauth_client_public_key')
  sessionStorage.removeItem('oauth_client_private_key')

  // Use data.access_token to create your session
}
```

## Token Verification Response

The `/api/auth/verify` endpoint returns an OAuth2-compliant response:

```ts
interface VerifyTokenResponse {
  access_token: string // JWT token (3-minute TTL)
  token_type: 'Bearer'
  expires_in: number // 180 seconds (3 minutes)
  user: {
    sub?: string // User subject identifier (OIDC compliant, generated from username + salt)
    authenticated?: boolean
  }
  claims?: JwtPayload // Full JWT claims containing:
  // - iss: Issuer identifier (OIDC standard)
  // - sub: Subject identifier (OIDC standard, user identifier)
  // - authenticated: Authentication status
  // - provider: 'vercel-2fa'
  // - aud?: Audience (if provided)
  // - scope?: Scope (if provided)
  // - jti?: JWT ID (if replay protection enabled)
  // - iat: Issued at (automatically added by JWT library)
  // - exp: Expiration time (automatically added by JWT library)
}
```

## Security Best Practices

1. **Always validate state**: Compare the returned state with the stored state to prevent CSRF attacks
2. **Use HTTPS**:
   - **Production**: HTTPS is **required** for all API endpoints (`/api/oauth/public-key` and `/api/auth/verify`)
   - **Development**: HTTP is allowed for localhost and local IP addresses
   - **Localhost exemption**: In production, localhost and local/private IP addresses (10.x.x.x, 192.168.x.x, etc.) can use HTTP
   - This prevents man-in-the-middle attacks while allowing local development
3. **Validate origin**: In popup mode, always validate `event.origin` matches your auth server
4. **Clean up keys**: Always clear temporary keys from memory or sessionStorage after use
5. **Handle errors**: Implement proper error handling for network failures and invalid tokens
6. **Token expiration**: Access tokens expire in 3 minutes - exchange them for your own session tokens quickly

## Environment Variables

Configure the following environment variables on your auth server:

- `ACCESS_USERNAME`: Required username for authentication
- `ACCESS_TOTP_SECRET`: TOTP secret for 2FA (enables TOTP authentication)
- `ACCESS_WEBAUTHN_SECRET`: WebAuthn secret for 2FA (enables WebAuthn authentication)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `ENABLE_TOKEN_REPLAY_PROTECTION`: Set to `1` or `true` to enable token replay protection (requires Vercel KV)

## Error Handling

Common errors and how to handle them:

- **Popup blocked**: Prompt user to allow popups for your domain
- **Invalid state**: User may have refreshed the page - restart the flow
- **Token expired**: Token has expired (3-minute TTL) - restart the flow
- **Token already used**: Token replay protection detected reuse - restart the flow
- **HTTPS required**: In production, if you receive `401 Unauthorized` with message "HTTPS is required", ensure your application is using HTTPS. Localhost and local IP addresses are exempt from this requirement.
- **Network error**: Retry the request or show an error message

## HTTPS Requirements

The OAuth API endpoints enforce HTTPS in production environments:

### Production Environment

- **Required**: All requests to `/api/oauth/public-key` and `/api/auth/verify` must use HTTPS
- **Exception**: Localhost (`localhost`, `127.0.0.1`, `::1`) and local/private IP addresses can use HTTP
  - Private IP ranges: `10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`, `169.254.x.x`
  - IPv6: `fc00::/7`, `fe80::/10`

### Development Environment

- **Allowed**: HTTP is allowed for all requests (no HTTPS requirement)

### Why HTTPS is Required

- **Man-in-the-middle protection**: Prevents attackers from intercepting and modifying OAuth tokens
- **Key exchange security**: Ensures ECDH key exchange happens over a secure channel
- **Token confidentiality**: Protects encrypted tokens during transmission

### Error Response

If HTTPS is required but not used, the API will return:

```json
{
  "code": 2000,
  "message": "HTTPS is required. Please use HTTPS to access this endpoint.",
  "data": null
}
```

Status code: `401 Unauthorized`
