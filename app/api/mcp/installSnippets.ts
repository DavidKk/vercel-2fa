export const MCP_INSTALL_SERVER_KEY = 'signet'

function utf8JsonToBase64(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

export function buildCursorMcpJson(mcpHttpUrl: string, serverKey: string = MCP_INSTALL_SERVER_KEY): string {
  return JSON.stringify({ mcpServers: { [serverKey]: { url: mcpHttpUrl } } }, null, 2)
}

export function buildCursorMcpInstallDeepLink(mcpHttpUrl: string, serverKey: string = MCP_INSTALL_SERVER_KEY): string {
  const config = encodeURIComponent(utf8JsonToBase64(JSON.stringify({ url: mcpHttpUrl })))
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(serverKey)}&config=${config}`
}

export type VsCodeMcpInstallChannel = 'stable' | 'insiders'

export function buildVsCodeMcpInstallDeepLink(mcpHttpUrl: string, serverKey: string = MCP_INSTALL_SERVER_KEY, channel: VsCodeMcpInstallChannel = 'stable'): string {
  const payload = {
    name: serverKey,
    type: 'http',
    url: mcpHttpUrl,
    headers: {} as Record<string, string>,
  }
  const scheme = channel === 'insiders' ? 'vscode-insiders' : 'vscode'
  return `${scheme}:mcp/install?${encodeURIComponent(JSON.stringify(payload))}`
}
