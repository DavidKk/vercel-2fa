# TOTP Principles

## Overview

TOTP (Time-based One-Time Password) is a time-synchronized one-time password algorithm widely used for two-factor authentication (2FA). It generates temporary codes that change every 30 seconds.

## Core Principles

### 1. Time Synchronization Mechanism

TOTP generates dynamic passwords based on current time:

- Divide current Unix timestamp by time step (usually 30 seconds)
- Use HMAC-SHA1 algorithm with shared secret to generate hash
- Extract 6-digit code from hash as verification code
- Both client and server must have synchronized time

### 2. Shared Secret

The foundation of TOTP authentication:

- **Server generates**: Random secret (usually Base32 encoded)
- **User obtains**: Secret by scanning QR code or manual entry
- **Stored locally**: Secret stored on both client device and server
- **Never transmitted**: After initial setup, secret never sent over network

### 3. Algorithm Formula

```
TOTP = HOTP(K, T)

Where:
  K = Shared secret key
  T = floor(Current Unix timestamp / Time step)
  HOTP = HMAC-SHA1 based dynamic truncation algorithm
```

### 4. Time Window

TOTP uses time windows to handle clock drift:

- **Time step**: Usually 30 seconds
- **Tolerance**: Server accepts codes from previous/next window (±1 window)
- **Clock skew**: Allows up to ±30 seconds time difference
- **Prevents replay**: Each code can only be used once per time window

## Workflow

### Setup Process

1. **Generate secret**: Server creates random Base32-encoded secret key
2. **Display QR code**: Encode secret, app name, and username into QR code
3. **Scan and add**: User scans with authenticator app
4. **Verify binding**: User enters first generated code to confirm setup
5. **Store credentials**: Server stores username-secret mapping

### Verification Process

1. **User gets code**: Open authenticator app to view current 6-digit code
2. **Enter code**: Input code on login or verification page
3. **Server calculates**: Generate expected codes for current time window
4. **Time drift tolerance**: Check current, previous, and next time windows
5. **Compare and verify**: If codes match, authentication succeeds
6. **Prevent reuse**: Mark used codes to prevent replay attacks

## Security Features

1. **Time-limited validity**: Codes expire after 30 seconds automatically
2. **One-time use**: Each code can only be used once (server tracks usage)
3. **Offline generation**: Client generates codes without network connection
4. **Secret security**: Secret never transmitted after initial setup
5. **Resistant to interception**: Even if code is intercepted, it expires quickly
6. **No password storage**: Reduces risk of password database breaches

## Technical Details

### QR Code Format

```
otpauth://totp/AppName:Username?secret=SECRET&issuer=AppName
```

### Code Generation

1. Get current Unix timestamp
2. Calculate time counter: `T = floor(timestamp / 30)`
3. Generate HMAC-SHA1: `HMAC(secret, T)`
4. Dynamic truncation to get 6-digit code
5. Return code with leading zeros if needed

### Security Considerations

- Use cryptographically secure random number generator for secrets
- Implement rate limiting to prevent brute force attacks
- Track used codes to prevent replay attacks
- Maintain accurate server time synchronization
- Provide backup recovery methods
