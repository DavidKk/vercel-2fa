/** User credential payload; persist after successful registration. */
export interface UserCredentials {
  /** Credential ID stored server-side */
  credentialID: string
  /** Public key bytes stored server-side */
  publicKey: Uint8Array
}

export interface StoreCredentials extends UserCredentials {
  rpId: string
  username: string
}
