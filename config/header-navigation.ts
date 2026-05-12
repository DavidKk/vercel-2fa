/**
 * Single source of truth for primary header links (docs, tools, playground, MCP, sign-in).
 * Used by AppHeader for desktop and mobile layouts.
 */
export interface HeaderToolLink {
  /** Short label shown in the Tools menu */
  label: string
  /** Target path */
  href: string
}

export interface HeaderPlainLink {
  label: string
  href: string
}

/** Tools grouped under one desktop dropdown / mobile accordion */
export const HEADER_TOOLS: HeaderToolLink[] = [
  { label: 'ECDH key pair', href: '/ecdh' },
  { label: 'TOTP QR code', href: '/totp' },
  { label: 'WebAuthn credential', href: '/webauthn' },
]

/** Docs hub */
export const HEADER_DOCS: HeaderPlainLink = {
  label: 'Docs',
  href: '/getting-started/overview',
}

/** OAuth sandbox entry (distinct from production sign-in in copy and styling) */
export const HEADER_PLAYGROUND: HeaderPlainLink = {
  label: 'Playground',
  href: '/oauth/playground',
}

/**
 * MCP integration docs entry (scroll target `id="mcp"` on Getting Started).
 */
export const HEADER_MCP: HeaderPlainLink = {
  label: 'MCP',
  href: '/getting-started/overview#mcp',
}

/** Primary authentication entry */
export const HEADER_SIGN_IN: HeaderPlainLink = {
  label: 'Sign in',
  href: '/login',
}
