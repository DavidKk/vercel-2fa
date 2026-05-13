import { type NextRequest } from 'next/server'

import { createMCPHttpServer, type McpResourceProvider } from '@/initializer/mcp'
import { createSignetMcpTools, SIGNET_MCP_SKILL, SIGNET_MCP_SKILL_URI, SIGNET_MCP_SKILL_URI_LEGACY } from '@/services/mcp/signetTools'
import { getPublicOriginFromNextRequest } from '@/utils/next-request-origin'

export const runtime = 'nodejs'

/** Shown in MCP clients for the OAuth integration skill (aligned with unbnd `resources[].description` style) */
const SIGNET_OAUTH_SKILL_DESCRIPTION = 'Agent-ready SKILL for third-party Signet login (redirect/JWT or ECDH OAuth return), allowlisted callbacks, and token verification.'

const resourceProvider: McpResourceProvider = {
  listResources: () => [
    {
      uri: SIGNET_MCP_SKILL_URI,
      name: 'signet-oauth-integration-skill.md',
      description: SIGNET_OAUTH_SKILL_DESCRIPTION,
      mimeType: 'text/markdown',
    },
  ],
  readResource: async (uri) => {
    if (uri !== SIGNET_MCP_SKILL_URI && uri !== SIGNET_MCP_SKILL_URI_LEGACY) {
      return null
    }
    return { mimeType: 'text/markdown', text: SIGNET_MCP_SKILL }
  },
}

function createServer(req: NextRequest) {
  const origin = getPublicOriginFromNextRequest(req)
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const host = forwardedHost || req.headers.get('host') || undefined

  const tools = createSignetMcpTools({
    origin,
    host,
  })

  return createMCPHttpServer('signet', '1.0.0', 'MCP tools for integrating third-party apps with Signet login.', tools, resourceProvider)
}

export async function GET(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
  return createServer(req).manifest(req, context)
}

export async function POST(req: NextRequest, context: { params: Promise<Record<string, string>> }) {
  return createServer(req).execute(req, context)
}
