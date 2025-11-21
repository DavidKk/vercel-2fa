# ECDH OAuth Flow

This diagram illustrates the complete ECDH-encrypted OAuth flow with OAuth2-like token verification:

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Client as Client Service
    participant AuthWindow as Auth Window (2FA)
    participant Auth as Auth Server (2FA)

    Note over User: 1. User clicks "Login with 2FA"

    User->>Client: Request login page
    Client->>Auth: GET /api/oauth/public-key
    Auth-->>Client: Return server public key (base64 SPKI)

    User->>User: Generate temporary ECDH key pair (sk_temp, pk_temp)
    User->>User: Store sk_temp in memory (not sessionStorage)
    User->>User: Generate random state UUID
    User->>User: Register postMessage listener

    User->>AuthWindow: window.open(/oauth?pk_temp + state + callbackOrigin)
    Note over AuthWindow: User authenticates (username/password + 2FA)
    AuthWindow->>Auth: POST /api/auth/login (with credentials)
    Auth->>Auth: Generate JWT token (username, authenticated)
    Auth->>Auth: Derive shared key (server_sk + client_pk)
    Auth->>Auth: Encrypt JWT with shared key → encrypted_token
    Auth-->>AuthWindow: Return encrypted_token

    AuthWindow->>User: postMessage({type: 'OAUTH_RESULT', state, encryptedToken}, callbackOrigin)
    AuthWindow->>AuthWindow: Close window

    User->>User: Validate event.origin === 2FA origin
    User->>User: Validate event.source === opened window
    User->>User: Validate message.type === 'OAUTH_RESULT'
    User->>User: Validate message.state === stored state
    User->>User: Derive shared key (client_sk + server_pk)
    User->>User: Decrypt encryptedToken → JWT
    User->>User: Clear sk_temp from memory
    User->>User: Remove postMessage listener

    User->>Auth: POST /api/auth/verify with JWT
    Note over Auth: Verify JWT signature & claims
    Auth->>Auth: Generate new access_token (JWT, 15min TTL)
    Auth-->>User: Return OAuth2 response (access_token, token_type, expires_in, user)

    User->>Client: Send access_token to client service
    Client->>Client: Generate own session JWT/cookie
    Client-->>User: Login successful
```

## Flow Explanation

1. **Get Server Public Key**: Client fetches the current server public key from `/api/oauth/public-key` endpoint (no need to store in client config)
2. **User initiates login**: User clicks "Login with 2FA" button
3. **Temporary key generation**: Browser generates a temporary ECDH key pair (client private key + client public key)
4. **State generation**: Client generates a random UUID for CSRF protection
5. **PostMessage listener**: Client registers a `window.addEventListener('message')` listener to receive the OAuth result
6. **Open auth window**: Client opens a new window via `window.open()` to the auth server with client public key, state, and callback origin
7. **User authentication**: User authenticates on the 2FA service in the opened window (username/password + 2FA)
8. **Token generation**: Server generates a JWT token containing user identity and authentication status
9. **Shared secret derivation**: Both parties compute the same shared secret using ECDH (server private key + client public key)
10. **Token encryption**: Server encrypts the JWT token with the shared secret using AES-256-GCM
11. **PostMessage callback**: Auth window sends encrypted token via `window.opener.postMessage()` with strict origin validation
12. **Security validation**: Client validates:
    - `event.origin` matches the 2FA service origin
    - `event.source` matches the opened window reference
    - `message.type` is `'OAUTH_RESULT'`
    - `message.state` matches the stored state
13. **Token decryption**: Client decrypts the token using its temporary private key (stored in memory) and server public key
14. **Key cleanup**: Client immediately clears the temporary private key from memory and removes the postMessage listener
15. **Token verification**: Client sends the decrypted JWT to `/api/auth/verify` endpoint
16. **Access token issuance**: Auth server verifies the JWT and issues a new access token (OAuth2-compliant)
17. **Session creation**: Client service receives the access token and generates its own session JWT/cookie

## Security Features

- **Forward Secrecy**: Each session uses a new temporary key pair
- **One-Time Keys**: Temporary private keys are stored only in memory and cleared immediately after use
- **State Validation**: Random UUID prevents CSRF attacks
- **PostMessage Security**: Multiple layers of validation ensure message authenticity:
  - Origin validation (`event.origin`)
  - Source window validation (`event.source`)
  - Message type validation
  - State parameter validation
- **No URL Exposure**: Encrypted tokens are never exposed in URL parameters, preventing:
  - Browser history leaks
  - User copy/paste sharing
  - Referrer header exposure
- **Authenticated Encryption**: AES-256-GCM provides both confidentiality and authenticity
- **Dynamic Public Key**: Server public key is fetched dynamically, enabling seamless key rotation
- **OAuth2-Compatible**: Token verification endpoint follows OAuth2 standards for access token issuance
- **Whitelist Protection**: Public endpoints are protected by origin whitelist validation

## Key Endpoints

### `/api/oauth/public-key` (GET)

- Returns the current server ECDH public key in base64 SPKI format
- Protected by origin whitelist
- Enables dynamic key distribution without client redeployment

### `/api/auth/verify` (POST)

- Verifies the decrypted JWT token from the OAuth callback
- Returns OAuth2-compliant response with new access token
- Protected by origin whitelist
- Access token is a new JWT with 15-minute expiration
