# How to Use ECDH Key Generation

## Step 1: Generate Key Pair

1. **Navigate to the ECDH page**: Go to `/ecdh` in your application
2. **Click "Generate Key Pair"**: The system will generate a new ECDH key pair
3. **Wait for generation**: The process takes a few seconds

## Step 2: Copy Generated Keys

After generation, you'll see two key values:

### 1. Private Key (PEM Format)

- **Purpose**: Server-side use for ECDH key exchange
- **Storage**: Store in `ECDH_SERVER_PRIVATE_KEY` environment variable
- **Security**: **KEEP THIS SECRET** - Never expose or commit to version control
- **Format**: PEM format with `-----BEGIN PRIVATE KEY-----` header

### 2. Public Key (PEM Format)

- **Purpose**: Server-side use for internal operations
- **Storage**: Store in `ECDH_SERVER_PUBLIC_KEY` environment variable
- **Format**: PEM format with `-----BEGIN PUBLIC KEY-----` header

## Step 3: Add to Environment Variables

Add the generated keys to your `.env.local` file:

```bash
# Server-side keys (PEM format)
ECDH_SERVER_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ECDH_SERVER_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
```

**Note:** The public key is automatically shared with clients via the `/api/oauth/public-key` endpoint. No client-side environment variable is needed.

**Important Notes**:

- Keep the `\n` characters in the PEM format keys (they represent newlines)
- After adding to `.env.local`, restart your development server
- The public key is automatically shared with clients via the `/api/oauth/public-key` endpoint

## Step 4: Verify Setup

1. **Check environment variables**: Ensure both keys are set
2. **Test OAuth flow**: Use the `/oauth/playground` page to verify the ECDH flow works
3. **Monitor for errors**: Check console for any key-related errors

## Key Rotation

For security, periodically rotate your keys:

1. **Generate new key pair**: Use this page to create a new pair
2. **Update environment variables**: Replace old keys with new ones
3. **Restart services**: Restart your application to load new keys
4. **Clients automatically get new key**: Clients fetch the public key from `/api/oauth/public-key` endpoint, so they will automatically use the new key

## Troubleshooting

### "ECDH_SERVER_PRIVATE_KEY environment variable is not set"

- Ensure the private key is set in your `.env.local` file
- Check that the key includes the `-----BEGIN PRIVATE KEY-----` header
- Verify there are no extra spaces or formatting issues
