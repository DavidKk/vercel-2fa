'use server'

import type { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/server'
import { generateAuthenticationOptions, generateRegistrationOptions, verifyAuthenticationResponse, verifyRegistrationResponse } from '@simplewebauthn/server'

import type { UserCredentials } from '@/services/webauthn'

/** Registration challenge generation function parameter interface */
export interface GenerateRegisterOptionsProps {
  /** Username for identifying the registering user */
  username: string
  /** Relying Party ID, typically the application domain */
  rpId: string
  /** Optional application name */
  appName?: string
}

/** Registration response verification parameter interface */
export interface VerifyRegisterProps {
  /** Registration challenge value, needs to be temporarily stored in server session */
  challenge: string
  /** Registration credential returned by client */
  credential: RegistrationResponseJSON
  /** Expected origin URL */
  expectedOrigin: string
  /** Expected Relying Party ID */
  expectedRPID: string
}

/** Generate login challenge parameter interface */
export interface GenerateLoginOptionsProps {
  /** Relying Party ID */
  rpId: string
  /** From server retrieved user credentials */
  userCredentials: UserCredentials
}

/** Verify login parameter interface */
export interface VerifyLoginProps {
  /** Client returned authentication response */
  credentials: AuthenticationResponseJSON
  /** From server retrieved user credentials */
  userCredentials: UserCredentials
  /** Login challenge value, needs to be temporarily stored in server session */
  challenge: string
  /** Expected origin URL */
  expectedOrigin: string
  /** Expected Relying Party ID */
  expectedRPID: string
}

export async function generateRegisterOptions(props: GenerateRegisterOptionsProps) {
  const { username, rpId, appName } = props

  // Generate encryption safe random challenge value, used to prevent replay attacks
  // Each registration request will generate a new random value, ensuring the request's uniqueness
  const challenge = new Uint8Array(32)
  crypto.getRandomValues(challenge)

  return generateRegistrationOptions({
    rpName: appName || 'Vercel 2FA Demo',
    rpID: rpId,
    userID: new TextEncoder().encode(username),
    userName: username,
    userDisplayName: `${appName}-${username}`,
    attestationType: 'direct',
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      userVerification: 'required',
    },
    supportedAlgorithmIDs: [-7, -257],
    timeout: 60000,
    challenge,
  })
}

export async function verifyRegister(props: VerifyRegisterProps): Promise<UserCredentials> {
  const { credential: response, challenge: expectedChallenge, expectedOrigin, expectedRPID } = props
  const verification = await verifyRegistrationResponse({ response, expectedChallenge, expectedOrigin, expectedRPID })

  const { verified, registrationInfo } = verification
  if (!(verified && registrationInfo)) {
    throw new Error('Registration failed')
  }

  const { credential } = registrationInfo
  const credentialID = credential.id
  const publicKey = credential.publicKey

  if (!publicKey || !(publicKey instanceof Uint8Array)) {
    throw new Error('Invalid public key format')
  }

  return {
    credentialID,
    publicKey,
  }
}

export async function generateLoginOptions(props: GenerateLoginOptionsProps) {
  const { rpId: rpID, userCredentials } = props

  // Generate authentication options will automatically generate a new random challenge
  // Each login request will use a different challenge, even for multiple logins by the same user
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    timeout: 60000,
    allowCredentials: [
      {
        id: userCredentials.credentialID,
        transports: ['internal'],
      },
    ],
  })

  return options
}

export async function verifyLogin(props: VerifyLoginProps) {
  // Verify login response by comparing challenge to prevent replay attacks
  // Even if an attacker obtains previous response data, verification will fail due to challenge mismatch
  const { credentials: response, userCredentials, challenge: expectedChallenge, expectedOrigin, expectedRPID } = props

  // Verify login response by comparing challenge to prevent replay attacks
  // Even if an attacker obtains previous response data, verification will fail due to challenge mismatch
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge, // Verify if the returned challenge matches the previously generated value
    expectedOrigin,
    expectedRPID,
    credential: {
      id: userCredentials.credentialID,
      publicKey: userCredentials.publicKey,
      // Since we use challenge mechanism to prevent replay attacks, counter can remain fixed here
      counter: 0,
      transports: ['internal'],
    },
  })

  if (!verification.verified) {
    throw new Error('Login failed')
  }

  return true
}
