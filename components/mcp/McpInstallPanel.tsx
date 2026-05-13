'use client'

import { useLayoutEffect, useMemo, useState } from 'react'
import { FiCheck, FiCopy, FiCpu, FiExternalLink } from 'react-icons/fi'

import { buildCursorMcpInstallDeepLink, buildCursorMcpJson, buildVsCodeMcpInstallDeepLink, MCP_INSTALL_SERVER_KEY } from '@/app/api/mcp/installSnippets'
import { appUi } from '@/components/ui/app-tokens'

function getClientBaseUrl(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return window.location.origin
}

export type McpInstallPanelProps = {
  /**
   * Optional origin from the server so Cursor/VS Code install links use an absolute MCP URL on first paint.
   * When omitted, the panel fills from `window.location.origin` before the browser paints (via `useLayoutEffect`).
   */
  requestOrigin?: string
}

/**
 * Renders Signet MCP install actions: copy URL, editor deep links, and Cursor JSON config.
 * @param requestOrigin Optional scheme+host from the server (see {@link McpInstallPanelProps.requestOrigin})
 * @returns Section with install controls
 */
export function McpInstallPanel({ requestOrigin }: McpInstallPanelProps) {
  const fromServer = requestOrigin?.trim() ?? ''
  const [baseUrl, setBaseUrl] = useState(fromServer)
  const [copied, setCopied] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (fromServer) {
      return
    }
    const origin = getClientBaseUrl()
    if (origin) {
      setBaseUrl(origin)
    }
  }, [fromServer])

  const mcpUrl = baseUrl ? `${baseUrl}/api/mcp` : '/api/mcp'
  const cursorJson = useMemo(() => buildCursorMcpJson(mcpUrl), [mcpUrl])

  const copy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      setCopied(null)
    }
  }

  return (
    <section className={`${appUi.cardCompact} min-w-0`} aria-labelledby="mcp-install-title">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className={appUi.iconBox}>
            <FiCpu size={18} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className={`${appUi.sectionLabel} mb-1.5`}>Agent / MCP</p>
            <h3 id="mcp-install-title" className={`${appUi.panelTitle} mb-1`}>
              Install Signet MCP
            </h3>
            <p className={appUi.lead}>Add this endpoint to Cursor or VS Code so an agent can ask how to integrate third-party login.</p>
          </div>
        </div>
        <button type="button" onClick={() => copy('url', mcpUrl)} className={`${appUi.btnSecondary} min-h-9 px-3 py-1.5 text-xs sm:w-auto`}>
          {copied === 'url' ? <FiCheck size={14} aria-hidden /> : <FiCopy size={14} aria-hidden />}
          Copy MCP URL
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <a href={buildCursorMcpInstallDeepLink(mcpUrl)} className={`${appUi.btnPrimary} min-h-9 px-3 py-1.5 text-xs sm:w-auto`} rel="noopener noreferrer">
          <FiExternalLink size={14} aria-hidden />
          Cursor
        </a>
        <a href={buildVsCodeMcpInstallDeepLink(mcpUrl)} className={`${appUi.btnSecondary} min-h-9 px-3 py-1.5 text-xs sm:w-auto`} rel="noopener noreferrer">
          VS Code
        </a>
        <a
          href={buildVsCodeMcpInstallDeepLink(mcpUrl, MCP_INSTALL_SERVER_KEY, 'insiders')}
          className={`${appUi.btnSecondary} min-h-9 px-3 py-1.5 text-xs sm:w-auto`}
          rel="noopener noreferrer"
        >
          Insiders
        </a>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className={appUi.fieldLabel}>Manual config</label>
          <button
            type="button"
            onClick={() => copy('json', cursorJson)}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--nav-brand-text)] hover:underline"
          >
            {copied === 'json' ? <FiCheck size={13} aria-hidden /> : <FiCopy size={13} aria-hidden />}
            Copy JSON
          </button>
        </div>
        <pre className={`${appUi.codeBlock} max-h-40`}>
          <code className="whitespace-pre-wrap break-all">{cursorJson}</code>
        </pre>
      </div>
    </section>
  )
}
