# Environment Variables Configuration

This document describes all environment variables used in the Two-Factor Authentication Service.

## Required Variables

### ACCESS_USERNAME

- **Description**: Administrator username for login
- **Required**: Yes
- **Example**: `admin`

### ACCESS_PASSWORD

- **Description**: Administrator password for login
- **Required**: Yes
- **Example**: `your-secure-password`
- **Note**: Use a strong password in production

### JWT_SECRET

- **Description**: Secret key for JWT token signing
- **Required**: Yes
- **Minimum Length**: 32 characters recommended
- **Example**: `your-super-secret-jwt-key-minimum-32-characters-long`
- **Security**: Keep this secret secure and never expose it

## Two-Factor Authentication (At least one required)

### ACCESS_TOTP_SECRET

- **Description**: TOTP (Time-based One-Time Password) secret for 2FA
- **Required**: Optional (but at least one 2FA method must be configured)
- **Format**: Base32 encoded string
- **Example**: `JBSWY3DPEHPK3PXP`
- **Generation**: Can be generated using the `/totp` page

### ACCESS_WEBAUTHN_SECRET

- **Description**: WebAuthn credentials for biometric/hardware key authentication
- **Required**: Optional (but at least one 2FA method must be configured)
- **Format**: JSON string containing credential data
- **Example**: `{"id":"...","publicKey":"...","rpId":"..."}`
- **Generation**: Can be generated using the `/webauthn` page

## Optional Variables

### JWT_EXPIRES_IN

- **Description**: JWT token expiration time
- **Required**: No
- **Default**: `30d` (30 days)
- **Format**: String with time unit (s=seconds, m=minutes, h=hours, d=days)
- **Examples**:
  - `5m` - 5 minutes
  - `1h` - 1 hour
  - `7d` - 7 days
  - `30d` - 30 days

### ALLOWED_REDIRECT_URLS

- **Description**: Whitelist of allowed redirect URLs for third-party login integration
- **Required**: No (if not set, only relative paths are allowed)
- **Format**: Comma-separated list of URLs
- **Supports**: Wildcard patterns using `*`
- **Examples**:
  ```
  https://app1.example.com,https://app2.example.com,http://localhost:3000
  ```
  ```
  https://*.example.com,https://*.company.com
  ```
- **Wildcard Patterns**:
  - `https://*.example.com` - Matches any subdomain of example.com
  - `https://app-*.example.com` - Matches app-1.example.com, app-2.example.com, etc.

### NEXT_PUBLIC_BUILD_TIME

- **Description**: Build timestamp (auto-generated)
- **Required**: No
- **Note**: Automatically set during build process, do not modify manually

## Configuration Examples

### Development Environment

```bash
# .env.local
ACCESS_USERNAME=admin
ACCESS_PASSWORD=dev-password-123
ACCESS_TOTP_SECRET=JBSWY3DPEHPK3PXP
JWT_SECRET=dev-jwt-secret-key-minimum-32-chars
JWT_EXPIRES_IN=1h
ALLOWED_REDIRECT_URLS=http://localhost:3000,http://localhost:3001
```

### Production Environment (Vercel)

Configure these in your Vercel project settings:

```bash
ACCESS_USERNAME=admin
ACCESS_PASSWORD=your-strong-secure-password-here
ACCESS_TOTP_SECRET=YOUR_PRODUCTION_TOTP_SECRET
ACCESS_WEBAUTHN_SECRET={"id":"...","publicKey":"..."}
JWT_SECRET=your-production-jwt-secret-min-32-characters
JWT_EXPIRES_IN=30d
ALLOWED_REDIRECT_URLS=https://app.yourcompany.com,https://dashboard.yourcompany.com,https://*.yourcompany.com
```

## Security Best Practices

1. **Never commit sensitive values**: Use `.env.local` for local development and keep it out of version control
2. **Use strong secrets**: Generate cryptographically secure random strings for `JWT_SECRET`
3. **Rotate secrets regularly**: Especially for production environments
4. **Limit redirect URLs**: Only add trusted domains to `ALLOWED_REDIRECT_URLS`
5. **Use environment-specific configs**: Different values for dev, staging, and production
6. **Secure storage**: Use secure secret management services (e.g., Vercel Secrets, AWS Secrets Manager)

## Generating Secure Secrets

### Generate JWT_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Generate TOTP Secret

Visit the `/totp` page in the application to generate a TOTP secret and QR code.

### Generate WebAuthn Secret

Visit the `/webauthn` page in the application to register a WebAuthn credential.

## Troubleshooting

### "2FA is not enabled" Error

- Ensure at least one of `ACCESS_TOTP_SECRET` or `ACCESS_WEBAUTHN_SECRET` is configured

### "Invalid server configuration" Error

- Check that `JWT_SECRET` is set and has sufficient length
- Verify that required environment variables are properly configured

### "Invalid Redirect URL" Error

- The redirect URL is not in the `ALLOWED_REDIRECT_URLS` whitelist
- Add the URL to the whitelist or use a relative path

### JWT Token Verification Fails

- Ensure `JWT_SECRET` matches between auth service and client applications
- Check that the token has not expired
- Verify the token format is correct

## References

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
