import { FiCpu } from 'react-icons/fi'

import { McpInstallPanel } from '@/components/mcp/McpInstallPanel'
import { generate } from '@/components/Meta'
import { appUi } from '@/components/ui/app-tokens'

const { generateMetadata } = generate({
  title: 'Signet MCP',
  description: 'Install the Signet MCP endpoint in Cursor or VS Code so agents can generate third-party login integration guidance.',
})

export { generateMetadata }

export default function McpPage() {
  return (
    <main className="flex min-h-[calc(100dvh-var(--header-height))] flex-1 flex-col bg-[var(--nav-link-hover-bg)]">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex items-start gap-3">
          <div className={appUi.iconBox}>
            <FiCpu size={18} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className={`${appUi.sectionLabel} mb-1.5`}>Agent / MCP</p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--nav-brand-text)] sm:text-3xl">Install Signet MCP</h1>
            <p className={`${appUi.lead} mt-2 max-w-2xl`}>
              Connect this endpoint to your editor so an agent can read the Signet integration skill, generate login URLs, validate callbacks, and list required env vars.
            </p>
          </div>
        </header>

        <McpInstallPanel />
      </div>
    </main>
  )
}
