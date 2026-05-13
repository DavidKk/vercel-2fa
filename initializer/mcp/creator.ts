import { type NextRequest, NextResponse } from 'next/server'

import type { ContextWithParams } from '@/initializer/controller'
import { api } from '@/initializer/controller'

import { applyNoStoreCache, JSONRPC, jsonRpcError, jsonRpcSuccess, mcpErrorinvalidArguments, mcpErrorMethodNotAllowed, mcpErrorToolNotFound, mcpResponse } from './response'
import type { Tool } from './tool'

export interface MCPManifestResource {
  uri: string
  name: string
  description?: string
  mimeType?: string
}

export interface McpResourceProvider {
  listResources: () => MCPManifestResource[]
  readResource: (uri: string) => Promise<{ mimeType: string; text: string } | null>
}

function withMCPHandler<P = any>(handler: (req: NextRequest, context: ContextWithParams<P>) => Promise<any>, allowedMethods: string[] = ['GET', 'POST']) {
  return api(async (req: NextRequest, context: ContextWithParams<P>) => {
    const method = req.method || 'GET'
    if (!allowedMethods.includes(method)) {
      return mcpErrorMethodNotAllowed(`Method ${method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`)
    }
    if (method === 'POST') {
      const contentType = req.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return mcpErrorinvalidArguments('Content-Type must be application/json for POST requests')
      }
    }
    return handler(req, context)
  })
}

function buildMCPToolsList(tools: Map<string, Tool>) {
  return Array.from(tools.values()).map((tool) => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.manifest.parameters,
  }))
}

function createManifestHandler(name: string, version: string, description: string, tools: Map<string, Tool>, resourceProvider?: McpResourceProvider | null) {
  return withMCPHandler(async () => {
    const manifest = {
      name,
      version,
      description,
      tools: Object.fromEntries(Array.from(tools.values()).map((tool) => [tool.name, { description: tool.description, inputSchema: tool.manifest.parameters }])),
      ...(resourceProvider ? { resources: resourceProvider.listResources() } : {}),
    }
    return applyNoStoreCache(NextResponse.json({ type: 'result', result: manifest }))
  }, ['GET'])
}

async function handleJsonRpcRequest(
  body: { id?: string | number | null; method?: string; params?: any },
  tools: Map<string, Tool>,
  service: { name: string; version: string; description?: string },
  resourceProvider?: McpResourceProvider | null
) {
  const id = body.id ?? null

  if (body.method === 'initialize') {
    return jsonRpcSuccess(id, {
      protocolVersion: body.params?.protocolVersion || '2025-06-18',
      capabilities: {
        tools: { listChanged: false },
        ...(resourceProvider ? { resources: { subscribe: false, listChanged: false } } : {}),
      },
      serverInfo: service,
    })
  }

  if (body.method === 'tools/list') {
    return jsonRpcSuccess(id, { tools: buildMCPToolsList(tools) })
  }

  if (body.method === 'resources/list') {
    if (!resourceProvider) {
      return jsonRpcError(id, JSONRPC.METHOD_NOT_FOUND, 'resources/list not supported for this MCP endpoint')
    }
    return jsonRpcSuccess(id, { resources: resourceProvider.listResources() })
  }

  if (body.method === 'resources/read') {
    if (!resourceProvider) {
      return jsonRpcError(id, JSONRPC.METHOD_NOT_FOUND, 'resources/read not supported for this MCP endpoint')
    }
    const uri = body.params?.uri
    if (!uri || typeof uri !== 'string') {
      return jsonRpcError(id, JSONRPC.INVALID_PARAMS, 'Missing or invalid "params.uri"')
    }
    const payload = await resourceProvider.readResource(uri.trim())
    if (!payload) {
      return jsonRpcError(id, JSONRPC.INVALID_PARAMS, `Unknown resource URI: ${uri}`)
    }
    return jsonRpcSuccess(id, { contents: [{ uri: uri.trim(), mimeType: payload.mimeType, text: payload.text }] })
  }

  if (body.method === 'tools/call') {
    const { name, arguments: args = {} } = body.params ?? {}
    if (!name || typeof name !== 'string') {
      return jsonRpcError(id, JSONRPC.INVALID_PARAMS, 'Missing or invalid "params.name"')
    }
    const tool = tools.get(name)
    if (!tool) {
      return jsonRpcError(id, JSONRPC.INVALID_PARAMS, `Unknown tool: ${name}`)
    }
    const validation = tool.validateParameters(args)
    if (validation !== true) {
      return jsonRpcError(id, JSONRPC.INVALID_PARAMS, String(validation))
    }
    try {
      const result = await tool.call(args)
      return jsonRpcSuccess(id, { content: [{ type: 'text' as const, text: JSON.stringify(result) }], isError: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      return jsonRpcSuccess(id, { content: [{ type: 'text' as const, text: message }], isError: true })
    }
  }

  return jsonRpcError(id, JSONRPC.METHOD_NOT_FOUND, `Method not found: ${body.method ?? 'undefined'}`)
}

function createToolExecutionHandler(name: string, version: string, description: string, tools: Map<string, Tool>, resourceProvider?: McpResourceProvider | null) {
  return withMCPHandler(
    async (req: NextRequest) => {
      const body = await req.json().catch(() => null)
      if (body == null || typeof body !== 'object') {
        return mcpErrorinvalidArguments('Invalid JSON body')
      }
      if (body.jsonrpc === '2.0' && typeof body.method === 'string') {
        return handleJsonRpcRequest(body, tools, { name, version, description }, resourceProvider)
      }
      const { tool: toolName, params = {} } = body
      if (!toolName) {
        return mcpErrorinvalidArguments('Missing tool name')
      }
      const tool = tools.get(toolName)
      if (!tool) {
        return mcpErrorToolNotFound(`Tool "${toolName}" not found`)
      }
      const validation = tool.validateParameters(params)
      if (validation !== true) {
        return mcpErrorinvalidArguments(validation)
      }
      return mcpResponse(await tool.call(params))
    },
    ['POST']
  )
}

export function createMCPHttpServer(
  name: string,
  version: string,
  description: string,
  tools: Record<string, Tool> | Map<string, Tool>,
  resourceProvider?: McpResourceProvider | null
) {
  const toolsMap = tools instanceof Map ? tools : new Map(Object.entries(tools))
  return {
    manifest: createManifestHandler(name, version, description, toolsMap, resourceProvider),
    execute: createToolExecutionHandler(name, version, description, toolsMap, resourceProvider),
  }
}
