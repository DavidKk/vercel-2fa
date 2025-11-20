# ECDH OAuth Flow

This diagram illustrates the complete ECDH-encrypted OAuth flow with OAuth2-like token verification:

```mermaid
sequenceDiagram
    participant User as User Browser
    participant Client as Client Service
    participant Auth as Auth Server (2FA)

    Note over User: 1. User clicks "Login with 2FA"

    User->>Client: Request login page
    Client->>Auth: GET /api/oauth/public-key
    Auth-->>Client: Return server public key (base64 SPKI)

    User->>User: Generate temporary ECDH key pair (sk_temp, pk_temp)
    User->>User: Store sk_temp in sessionStorage
    User->>User: Generate random state UUID

    User->>Auth: Redirect to /oauth with pk_temp + state + redirectUrl
    Note over Auth: User authenticates (username/password + 2FA)
    Auth->>Auth: Generate JWT token (username, authenticated)
    Auth->>Auth: Derive shared key (server_sk + client_pk)
    Auth->>Auth: Encrypt JWT with shared key → encrypted_token

    Auth-->>User: Redirect back with encrypted_token + state

    User->>User: Validate state parameter
    User->>User: Derive shared key (client_sk + server_pk)
    User->>User: Decrypt encrypted_token → JWT
    User->>User: Clear sk_temp from sessionStorage

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
5. **Key exchange**: Client redirects to auth server with client public key, state, and callback URL
6. **User authentication**: User authenticates on the 2FA service (username/password + 2FA)
7. **Token generation**: Server generates a JWT token containing user identity and authentication status
8. **Shared secret derivation**: Both parties compute the same shared secret using ECDH (server private key + client public key)
9. **Token encryption**: Server encrypts the JWT token with the shared secret using AES-256-GCM
10. **Callback**: Server redirects back to client with encrypted token and state
11. **State validation**: Client validates the state parameter matches the stored value
12. **Token decryption**: Client decrypts the token using its temporary private key and server public key
13. **Key cleanup**: Client immediately clears the temporary private key from sessionStorage
14. **Token verification**: Client sends the decrypted JWT to `/api/auth/verify` endpoint
15. **Access token issuance**: Auth server verifies the JWT and issues a new access token (OAuth2-compliant)
16. **Session creation**: Client service receives the access token and generates its own session JWT/cookie

## Security Features

- **Forward Secrecy**: Each session uses a new temporary key pair
- **One-Time Keys**: Temporary private keys are cleared immediately after use
- **State Validation**: Random UUID prevents CSRF attacks
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
