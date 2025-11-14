# How to Use This Page

## Step 1: Register Your Authenticator

1. **Enter your information**:

   - **Username**: Enter your preferred username
   - **App Name**: Enter the application name (usually pre-filled)

2. **Click "Generate Credential"**: The browser will prompt you to authenticate using:

   - Touch ID (MacBook, iPhone)
   - Face ID (iPhone, iPad)
   - Windows Hello (Windows PC)
   - Physical security key (YubiKey, etc.)

3. **Complete authentication**: Follow the device prompt to verify your identity

4. **Get your token**: After successful registration, you'll receive a JWT token

## Step 2: Verify Your Credential (Optional)

1. Click **"Verify Credential"** to test authentication
2. Use the same biometric method to authenticate
3. The system will verify your credential is working correctly

## Step 3: Use the Token

- Copy the generated JWT token
- Use it to authenticate on the login page
- The token contains your credential information for future logins

## Important Notes

- **Keep the page open**: Don't close the page before saving your token
- **One credential per device**: Each device generates its own unique credential
- **No password needed**: Your biometric data never leaves your device
- **Secure by design**: Private keys are stored in your device's secure chip
