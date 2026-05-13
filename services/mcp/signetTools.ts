import { tool } from '@/initializer/mcp'
import { getSignetMcpSkillMarkdown, SIGNET_INTEGRATION_FLOW_STEPS } from '@/services/mcp/signetIntegrationShared'
import { isAllowedRedirectUrl } from '@/utils/url'

export interface SignetMcpContext {
  origin: string
  host?: string
}

function stringParam(params: Record<string, unknown>, key: string): string | undefined {
  const value = params[key]
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function booleanParam(params: Record<string, unknown>, key: string): boolean {
  return params[key] === true
}

function buildVerifySnippet(origin: string, framework?: string): string {
  const fetchSnippet = `const response = await fetch('${origin}/api/auth/verify', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ token, audience: 'your-app' }),
})

if (!response.ok) {
  throw new Error('Signet token verification failed')
}

const { data } = await response.json()
// Create your app session from data.access_token / data.user`

  if (framework === 'nextjs') {
    return `import { cookies } from 'next/headers'

export async function completeLogin(token: string) {
  ${fetchSnippet
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
    .trim()}

  const cookieStore = await cookies()
  cookieStore.set('app_session', data.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}`
  }

  return fetchSnippet
}

/**
 * MCP resource URI for the bundled integration skill (same pattern as unbnd: `skill://{scope}/{file}.md`).
 * @see https://openapi.davidjones.fun/api/mcp
 */
export const SIGNET_MCP_SKILL_URI = 'skill://signet-oauth/signet-oauth-integration-skill.md'

/** Legacy URI; still accepted by `resources/read` for backward compatibility */
export const SIGNET_MCP_SKILL_URI_LEGACY = 'signet://skill/oauth-integration'

/** Full skill markdown (EN + 中文速览); built from {@link getSignetMcpSkillMarkdown} shared with Getting Started integration copy */
export const SIGNET_MCP_SKILL = getSignetMcpSkillMarkdown()

export function createSignetMcpTools(context: SignetMcpContext) {
  const tools = [
    tool(
      'signet_get_integration_guide',
      'Return a concise third-party login integration guide for Signet, including routes, env vars, and token verification snippet.',
      {
        type: 'object',
        properties: {
          framework: { type: 'string', enum: ['generic', 'nextjs'], description: 'Snippet style to generate.' },
          encryptedReturn: { type: 'boolean', description: 'Whether the app plans to use ECDH-encrypted OAuth return.' },
        },
      },
      (params: Record<string, unknown>) => {
        const framework = stringParam(params, 'framework') || 'generic'
        const encryptedReturn = booleanParam(params, 'encryptedReturn')
        return {
          summary: 'Integrate by redirecting users to Signet, verifying the returned token, then creating your own app session.',
          flowSteps: [...SIGNET_INTEGRATION_FLOW_STEPS],
          routes: {
            directLogin: `${context.origin}/login?redirectUrl=<callback-url>`,
            oauthLogin: `${context.origin}/oauth?redirectUrl=<callback-url>&clientPublicKey=<base64-spki>`,
            verify: `${context.origin}/api/auth/verify`,
            publicKey: `${context.origin}/api/oauth/public-key`,
          },
          requiredEnv: ['ACCESS_USERNAME', 'ACCESS_PASSWORD', 'JWT_SECRET', 'ACCESS_TOTP_SECRET or ACCESS_WEBAUTHN_SECRET'],
          optionalEnv: encryptedReturn ? ['ECDH_SERVER_PRIVATE_KEY', 'ALLOWED_REDIRECT_URLS', 'OAUTH_ISSUER'] : ['ALLOWED_REDIRECT_URLS', 'OAUTH_ISSUER'],
          steps: [
            'Configure Signet env vars and at least one second factor.',
            'Whitelist cross-origin callback origins with ALLOWED_REDIRECT_URLS.',
            'Redirect the user to Signet with redirectUrl and a random state.',
            'On callback, post the returned token to /api/auth/verify.',
            'Create the downstream application session from the verification response.',
          ],
          verifySnippet: buildVerifySnippet(context.origin, framework),
        }
      }
    ),
    tool(
      'signet_build_login_url',
      'Build a Signet login or OAuth URL for a third-party callback without performing authentication.',
      {
        type: 'object',
        required: ['redirectUrl'],
        properties: {
          redirectUrl: { type: 'string', description: 'Callback URL in the third-party app.' },
          state: { type: 'string', description: 'Optional CSRF state.' },
          encryptedReturn: { type: 'boolean', description: 'Use /oauth and include ECDH params.' },
          clientPublicKey: { type: 'string', description: 'Base64 SPKI client public key for encrypted OAuth.' },
          callbackOrigin: { type: 'string', description: 'Expected postMessage origin for popup OAuth.' },
        },
      },
      (params: Record<string, unknown>) => {
        const redirectUrl = stringParam(params, 'redirectUrl')
        if (!redirectUrl) {
          throw new Error('redirectUrl is required')
        }
        const encryptedReturn = booleanParam(params, 'encryptedReturn')
        const url = new URL(encryptedReturn ? '/oauth' : '/login', context.origin)
        url.searchParams.set('redirectUrl', redirectUrl)
        const state = stringParam(params, 'state')
        if (state) url.searchParams.set('state', state)
        if (encryptedReturn) {
          const clientPublicKey = stringParam(params, 'clientPublicKey')
          if (clientPublicKey) url.searchParams.set('clientPublicKey', clientPublicKey)
          const callbackOrigin = stringParam(params, 'callbackOrigin')
          if (callbackOrigin) url.searchParams.set('callbackOrigin', callbackOrigin)
        }
        return {
          url: url.toString(),
          allowedByCurrentConfig: isAllowedRedirectUrl(redirectUrl, context.host),
          note: encryptedReturn ? 'Use this URL only after generating a client ECDH key pair.' : 'Direct login returns a callback token to redirectUrl.',
        }
      }
    ),
    tool(
      'signet_validate_redirect_url',
      'Check whether a redirect URL is allowed by Signet same-origin and ALLOWED_REDIRECT_URLS rules.',
      {
        type: 'object',
        required: ['redirectUrl'],
        properties: {
          redirectUrl: { type: 'string' },
          currentHost: { type: 'string', description: 'Optional host override; defaults to the MCP request host.' },
        },
      },
      (params: Record<string, unknown>) => {
        const redirectUrl = stringParam(params, 'redirectUrl')
        if (!redirectUrl) {
          throw new Error('redirectUrl is required')
        }
        const currentHost = stringParam(params, 'currentHost') || context.host
        return {
          redirectUrl,
          currentHost,
          allowed: isAllowedRedirectUrl(redirectUrl, currentHost),
          allowedRedirectUrlsConfigured: Boolean(process.env.ALLOWED_REDIRECT_URLS),
          allowedRedirectUrls: process.env.ALLOWED_REDIRECT_URLS || null,
        }
      }
    ),
    tool(
      'signet_get_env_checklist',
      'Return the env vars needed for a chosen Signet setup.',
      {
        type: 'object',
        properties: {
          secondFactor: { type: 'string', enum: ['totp', 'webauthn', 'both'] },
          encryptedReturn: { type: 'boolean' },
          replayProtection: { type: 'boolean' },
        },
      },
      (params: Record<string, unknown>) => {
        const secondFactor = stringParam(params, 'secondFactor') || 'both'
        const encryptedReturn = booleanParam(params, 'encryptedReturn')
        const replayProtection = booleanParam(params, 'replayProtection')
        const required = ['ACCESS_USERNAME', 'ACCESS_PASSWORD', 'JWT_SECRET']
        if (secondFactor === 'totp' || secondFactor === 'both') required.push('ACCESS_TOTP_SECRET')
        if (secondFactor === 'webauthn' || secondFactor === 'both') required.push('ACCESS_WEBAUTHN_SECRET')
        if (encryptedReturn) required.push('ECDH_SERVER_PRIVATE_KEY')
        if (replayProtection) required.push('AUTH_KV_REST_API_URL', 'AUTH_KV_REST_API_TOKEN', 'ENABLE_TOKEN_REPLAY_PROTECTION=1')
        return {
          required,
          optional: ['JWT_EXPIRES_IN', 'ACCESS_EMAIL', 'ALLOWED_REDIRECT_URLS', 'OAUTH_ISSUER', 'USER_SUB_SALT'],
          notes: [
            'At least one of ACCESS_TOTP_SECRET or ACCESS_WEBAUTHN_SECRET must be configured.',
            'ALLOWED_REDIRECT_URLS is required for cross-origin callbacks.',
            'ECDH_SERVER_PUBLIC_KEY is only a local debugging convenience; production clients should call /api/oauth/public-key.',
          ],
        }
      }
    ),
  ]

  return new Map(tools.map((item) => [item.name, item]))
}
