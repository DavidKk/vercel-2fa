# How to Use This Page

## Step 1: Generate TOTP Secret

1. **Enter your information**:

   - **App Name**: Enter the application name (usually pre-filled)
   - **Username**: Enter your username or email

2. **Click "Generate TOTP"**: The system will:
   - Generate a random secret key
   - Display a QR code for easy scanning
   - Show the secret key in text format

## Step 2: Scan QR Code

1. **Open your authenticator app**:

   - Google Authenticator (iOS/Android)
   - Microsoft Authenticator
   - Authy
   - 1Password
   - Any TOTP-compatible app

2. **Scan the QR code**: Use the app's camera to scan the displayed QR code

3. **Or manually enter**: If scanning doesn't work, manually enter the secret key shown

## Step 3: Verify Your Setup

1. **Get verification code**: Open your authenticator app and view the 6-digit code

2. **Enter the code**: Input the current code in the verification field

3. **Verify**: Click verify to confirm the setup is working correctly

4. **Get your token**: After successful verification, you'll receive a JWT token

## Step 4: Use the Token

- Copy the generated JWT token
- Use it to authenticate on the login page
- The token contains your TOTP information for future logins

## Important Notes

- **Save your secret**: Keep the secret key in a safe place as backup
- **Time synchronization**: Ensure your device's time is accurate (codes are time-based)
- **30-second validity**: Each code expires after 30 seconds
- **Multiple devices**: You can add the same secret to multiple authenticator apps
- **Backup codes**: Consider saving backup codes for account recovery
