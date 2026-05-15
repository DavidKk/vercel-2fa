import { tool } from '@/initializer/mcp'
import { getSignetMcpSkillMarkdown, SIGNET_INTEGRATION_FLOW_STEPS, SIGNET_INTEGRATION_MODE_BULLETS } from '@/services/mcp/signetIntegrationShared'
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
  const browserSnippet = `const signet = await import(/* webpackIgnore: true */ '${origin}/sdk/signet-client.mjs')
const result = await signet.verifyTokenAtAuthCenter({
  authCenterOrigin: '${origin}',
  token,
  audience: 'your-app',
})

if (!result.ok) {
  throw new Error(result.error || 'Signet token verification failed')
}

const data = result.response.data
// Create your app session from data.access_token / data.user`

  if (framework === 'nextjs') {
    return `import { cookies } from 'next/headers'

let signetSdkPromise: Promise<any> | null = null

async function loadSignetSdk() {
  signetSdkPromise ??= fetch('${origin}/sdk/signet-client.mjs')
    .then((response) => {
      if (!response.ok) throw new Error('Failed to load Signet SDK')
      return response.text()
    })
    .then((source) => import(\`data:text/javascript;base64,\${Buffer.from(source).toString('base64')}\`))
  return signetSdkPromise
}

export async function completeLogin(token: string) {
  const signet = await loadSignetSdk()
  const result = await signet.verifyTokenAtAuthCenter({
    authCenterOrigin: '${origin}',
    token,
    audience: 'your-app',
  })

  if (!result.ok) {
    throw new Error(result.error || 'Signet token verification failed')
  }

  const data = result.response.data

  const cookieStore = await cookies()
  cookieStore.set('app_session', data.access_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}`
  }

  return browserSnippet
}

/**
 * MCP resource URI for the bundled integration skill (same pattern as unbnd: `skill://{scope}/{file}.md`).
 * HTTP MCP lives at `/api/mcp` on the Signet deployment; use {@link process.env.SIGNET_PUBLIC_ORIGIN} so tools return your canonical host.
 */
export const SIGNET_MCP_SKILL_URI = 'skill://signet-oauth/signet-oauth-integration-skill.md'

/** Legacy URI; still accepted by `resources/read` for backward compatibility */
export const SIGNET_MCP_SKILL_URI_LEGACY = 'signet://skill/oauth-integration'

/** Full skill markdown (EN quick reference); built from {@link getSignetMcpSkillMarkdown} shared with Getting Started integration copy */
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
          summary:
            'Integrate by redirecting users to Signet, parsing/verifying with the hosted SDK at /sdk/signet-client.mjs, then creating your own app session. Use the SDK helpers by default instead of duplicating URL, parser, or verify logic.',
          hostedSdkUrl: `${context.origin}/sdk/signet-client.mjs`,
          referenceImplementation: {
            name: 'vercel-web-scripts (MagickMonkey)',
            patterns: [
              'lib/signet-sdk-url.ts — getSignetSdkModuleUrl() from NEXT_PUBLIC_VERCEL_2FA_ORIGIN / VERCEL_2FA_ORIGIN / NEXT_PUBLIC_SIGNET_SDK_URL',
              'lib/load-signet-sdk.ts — cached loadSignetSdk() with import(/* webpackIgnore: true */ url)',
              'App Router /auth/vercel-2fa/callback — await loadSignetSdk() then parseLoginCallbackParams(request.url or searchParams) + verifyTokenAtAuthCenter for /login flow',
              'OAuth client hook — buildOAuthLoginUrl; parseLoginCallbackParams(href); stripLoginCallbackFromUrl after success',
            ],
          },
          pitfalls: [
            '/oauth puts token in URL hash — useSearchParams() alone will not see it; use parseLoginCallbackParams(window.location.href).',
            'Server Route Handlers never receive the hash fragment; use /login + query callback if you need purely server-side token read.',
            'Do not hand-write fetch calls to /api/auth/verify in generated integrations; use SDK verifyTokenAtAuthCenter so response handling stays aligned with Signet.',
            'ALLOWED_REDIRECT_URLS must include the exact callback origin used in production.',
          ],
          sdkExports: [
            'normalizeAuthCenterOrigin',
            'getVerifyApiUrl',
            'getOAuthPublicKeyUrl',
            'buildLoginUrl',
            'buildOAuthLoginUrl',
            'parseLoginCallbackParams',
            'getLoginCallbackFromWindow',
            'stripLoginCallbackFromUrl',
            'isLoginCallbackTokenInHash',
            'verifyTokenAtAuthCenter',
          ],
          mcpExamples: {
            signet_get_integration_guide: { framework: 'nextjs', encryptedReturn: true },
            signet_build_login_url: {
              redirectUrl: 'https://your-app.example.com/auth/callback',
              state: '550e8400-e29b-41d4-a716-446655440000',
              encryptedReturn: false,
            },
            signet_build_login_url_oauth: {
              redirectUrl: 'https://your-app.example.com/auth/callback',
              state: '550e8400-e29b-41d4-a716-446655440000',
              encryptedReturn: true,
              clientPublicKey: '<base64 SPKI from your ECDH keypair>',
            },
            signet_validate_redirect_url: { redirectUrl: 'https://your-app.example.com/auth/callback' },
          },
          flowSteps: [...SIGNET_INTEGRATION_FLOW_STEPS],
          integrationModes: [...SIGNET_INTEGRATION_MODE_BULLETS],
          agentDecisionRule:
            'If the consumer project has a backend/session layer, implement backend-owned session. If it is static/frontend-only, implement frontend-only and warn that no httpOnly cookie is possible. If unclear, ask the user before coding.',
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
            'Load the hosted SDK and call buildLoginUrl/buildOAuthLoginUrl with redirectUrl and a random state.',
            'On callback, parse token/state with parseLoginCallbackParams, then call verifyTokenAtAuthCenter.',
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
          note: encryptedReturn
            ? 'Generate a client ECDH key pair first. OAuth return: token/state are in the callback URL hash (#…). Use hosted SDK parseLoginCallbackParams(window.location.href). Server Route Handlers cannot read the hash.'
            : 'Direct login returns token+state in query on redirectUrl. Use hosted SDK parseLoginCallbackParams and verifyTokenAtAuthCenter in the callback.',
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
