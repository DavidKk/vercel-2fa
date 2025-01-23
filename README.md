[![Build Status](https://github.com/DavidKk/vercel-2fa/actions/workflows/coverage.workflow.yml/badge.svg)](https://github.com/DavidKk/vercel-2fa/actions/workflows/coverage.workflow.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Two-Factor Authentication Service

[online](https://vercel-2fa.vercel.app)

A simple and user-friendly two-factor authentication service based on the TOTP (Time-Based One-Time Password) standard for enhanced security.

- **Purpose**: Provide more secure login verification to reduce risks caused by password leaks.
- **Use Cases**: User login verification, identity confirmation for sensitive operations, and more.

## Deploy to Vercel

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYourUsername%2Ftwo-factor-auth)

## Quick Start

1. **Generate QR Code and Secret**

   - Use the provided form to input the username and application name to generate a QR code and secret for binding two-factor authentication.
   - Store the secret on the server, and let users scan the QR code to bind it to their authenticator (e.g., Google Authenticator).

2. **Validate User's Dynamic Code**
   - The user inputs the 6-digit dynamic code generated by their authenticator.
   - The server uses the stored secret and the `otplib` library to verify the validity of the code.

### Example Code

#### Validate Dynamic Code

```typescript
import { authenticator } from 'otplib'

const isValid = authenticator.check(token, secret)
if (isValid) {
  console.log('Token is valid!')
} else {
  console.log('Token is invalid or expired.')
}
```

Features

- Automatically generate two-factor authentication secrets and QR codes.
- Validate the dynamic codes for authenticity.
- Supports deployment on Vercel for quick and easy setup.

Important Notes

- **Secure Storage**: Secrets must be stored on the server and never exposed to users.
- **Time Synchronization**: Ensure server and client times are synchronized to prevent validation failures due to time drift.
