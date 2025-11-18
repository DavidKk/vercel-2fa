# How to Use ECDH Key Generation

## Step 1: Generate Key Pair

1. **Navigate to the ECDH page**: Go to `/ecdh` in your application
2. **Click "Generate Key Pair"**: The system will generate a new ECDH key pair
3. **Wait for generation**: The process takes a few seconds

## Step 2: Copy Generated Keys

After generation, you'll see three key values:

### 1. Private Key (PEM Format)

- **Purpose**: Server-side use for ECDH key exchange
- **Storage**: Store in `ECDH_SERVER_PRIVATE_KEY` environment variable
- **Security**: **KEEP THIS SECRET** - Never expose or commit to version control
- **Format**: PEM format with `-----BEGIN PRIVATE KEY-----` header

### 2. Public Key (PEM Format)

- **Purpose**: Server-side use for internal operations
- **Storage**: Store in `ECDH_SERVER_PUBLIC_KEY` environment variable
- **Format**: PEM format with `-----BEGIN PUBLIC KEY-----` header

### 3. Public Key (Base64 SPKI Format)

- **Purpose**: Client-side use for OAuth flow
- **Storage**: Store in `NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY` environment variable
- **Security**: Safe to expose (public key)
- **Format**: Base64-encoded DER format (SPKI)

## Step 3: Add to Environment Variables

Add the generated keys to your `.env.local` file:

```bash
# Server-side keys (PEM format)
ECDH_SERVER_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ECDH_SERVER_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"

# Client-side public key (base64 SPKI format)
NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY="base64-encoded-public-key-here"
```

**Important Notes**:

- Keep the `\n` characters in the PEM format keys (they represent newlines)
- The base64 public key should be a single line with no spaces or line breaks
- After adding to `.env.local`, restart your development server

## Step 4: Verify Setup

1. **Check environment variables**: Ensure all three keys are set
2. **Test OAuth flow**: Use the `/oauth/test` page to verify the ECDH flow works
3. **Monitor for errors**: Check console for any key-related errors

## Key Rotation

For security, periodically rotate your keys:

1. **Generate new key pair**: Use this page to create a new pair
2. **Update environment variables**: Replace old keys with new ones
3. **Restart services**: Restart your application to load new keys
4. **Update clients**: If clients cache the public key, they may need to refresh

## Troubleshooting

### "ECDH_SERVER_PRIVATE_KEY environment variable is not set"

- Ensure the private key is set in your `.env.local` file
- Check that the key includes the `-----BEGIN PRIVATE KEY-----` header
- Verify there are no extra spaces or formatting issues

### "Failed to import public key"

- Check that `NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY` is set correctly
- Ensure the base64 string has no spaces or line breaks
- Verify the key was generated using this page (not manually)

### "Invalid base64 string"

- Ensure the base64 public key is a single continuous string
- Remove any whitespace, newlines, or special characters
- Regenerate the key pair if needed
