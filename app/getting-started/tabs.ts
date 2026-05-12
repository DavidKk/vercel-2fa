/** Valid URL segments under `/getting-started/[tab]`. */
export const GETTING_STARTED_TABS = ['overview', 'totp', 'webauthn', 'ecdh', 'integration', 'env'] as const

export type GettingStartedTab = (typeof GETTING_STARTED_TABS)[number]

/**
 * Type guard for dynamic route param `tab`.
 * @param value Raw segment from the URL
 * @returns True when the segment is a known guide tab
 */
export function isGettingStartedTab(value: string): value is GettingStartedTab {
  return (GETTING_STARTED_TABS as readonly string[]).includes(value)
}
