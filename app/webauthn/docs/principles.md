# WebAuthn Principles

## Overview

WebAuthn (Web Authentication API) is a public-key cryptography-based authentication standard that allows users to authenticate using biometrics (fingerprint, Face ID) or physical security keys without passwords.

## Core Principles

### 1. Public Key Cryptography

WebAuthn uses asymmetric encryption:

- **Private Key**: Stored in the device's secure chip (e.g., Secure Enclave), never leaves the device
- **Public Key**: Stored on the server for identity verification
- Even if the server is compromised, attackers cannot obtain the private key

### 2. Challenge-Response Mechanism

Key mechanism to prevent replay attacks:

- Server generates a random challenge value each time
- Client signs the challenge with the private key
- Server verifies the signature with the public key
- Each challenge can only be used once

### 3. Core Terms

- **RP (Relying Party)**: The application server
- **RP ID**: Usually the domain name, credentials are bound to the domain to prevent phishing
- **Credential ID**: Unique credential identifier
- **Authenticator**: Authentication device (Touch ID, Face ID, YubiKey, etc.)

## Workflow

### Registration Process

1. **User initiates registration**: Enter username and app name, RP ID is set to current domain
2. **Server generates registration config**: Generate 32-byte random challenge, configure RP information
3. **Browser triggers authenticator**: Call `navigator.credentials.create()` API, device shows biometric prompt
4. **Authenticator generates key pair**: Generate private key in device's secure chip, return public key and credential ID
5. **Server validates and stores**: Verify challenge, origin, RP ID, and store public key and credential ID

### Authentication Process

1. **User initiates login**: Provide credential information
2. **Server generates login config**: Generate new random challenge, specify allowed credential ID
3. **Browser triggers authenticator**: Call `navigator.credentials.get()` API
4. **Authenticator signs challenge**: Sign the challenge with the private key
5. **Server verifies signature**: Verify signature with stored public key, login succeeds if verified

## Security Features

1. **Prevent replay attacks**: Use unique challenge each time, expires immediately after verification
2. **Private key protection**: Private key stored in hardware security module, never exported
3. **Domain binding**: Credentials bound to RP ID, prevents phishing websites
4. **User verification**: Requires biometric or PIN to ensure device owner
