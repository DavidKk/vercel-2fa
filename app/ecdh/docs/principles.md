# ECDH Principles

## Overview

ECDH (Elliptic Curve Diffie-Hellman) is a key exchange protocol that allows two parties to establish a shared secret over an insecure channel. It's used in this system to securely encrypt OAuth tokens during the authentication flow.

## Core Principles

### 1. Elliptic Curve Cryptography

ECDH uses elliptic curve mathematics for key exchange:

- **Elliptic Curve**: A mathematical curve defined by an equation (e.g., P-256/prime256v1)
- **Point on Curve**: Public keys are points on the curve
- **Scalar Multiplication**: Private keys are scalars used in point multiplication
- **Discrete Logarithm Problem**: Security relies on the difficulty of finding the private key from the public key

### 2. Key Exchange Process

The ECDH key exchange works as follows:

1. **Client generates temporary key pair**: `(sk_temp, pk_temp)`
2. **Server has permanent key pair**: `(server_private_key, server_public_key)`
3. **Shared secret derivation**:
   - Client: `shared_key = ECDH(sk_temp, server_public_key)`
   - Server: `shared_key = ECDH(server_private_key, pk_temp)`
4. **Both parties compute the same shared secret** without transmitting it

### 3. Security Properties

- **Forward Secrecy**: Each session uses a new temporary key pair
- **Public Key Safety**: Public keys can be safely shared (cannot derive private key)
- **Shared Secret**: Only parties with the correct key pairs can compute the shared secret
- **One-Time Use**: Temporary private keys are destroyed after use

### 4. Encryption Flow

After establishing the shared secret:

1. **Server encrypts payload**: Uses AES-256-GCM with the shared key
2. **Client decrypts payload**: Uses the same shared key to decrypt
3. **Authenticated Encryption**: GCM mode provides both confidentiality and authenticity

## Key Formats

### Server Keys

- **Private Key**: PEM format (PKCS#8), stored securely in environment variables
- **Public Key (PEM)**: PEM format (SPKI), used internally by server
- **Public Key (Base64)**: Base64-encoded DER format (SPKI), exposed to clients via `NEXT_PUBLIC_` environment variable

### Client Keys

- **Temporary Key Pair**: Generated in browser using Web Crypto API
- **Public Key**: Exported as base64 SPKI format, sent to server
- **Private Key**: Kept in browser memory, used for decryption, then destroyed

## Security Considerations

1. **Private Key Protection**: Server private key must never be exposed
2. **Key Rotation**: Regularly rotate server key pairs for enhanced security
3. **Temporary Keys**: Client temporary keys should be destroyed immediately after use
4. **HTTPS Required**: Always use HTTPS to protect key exchange
5. **Time Windows**: Encrypted tokens include timestamps to prevent replay attacks
