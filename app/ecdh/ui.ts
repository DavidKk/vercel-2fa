import { appUi } from '@/components/ui/app-tokens'

export { appUi }

/**
 * Layout shell for in-app tools under AppHeader (TOTP / WebAuthn / ECDH pattern).
 * Uses Signet CSS variables so light/dark match the rest of the app.
 */
export const toolPageShell = appUi.pageShell

/**
 * Centered card width for the ECDH generate step (comfortable reading + CTA).
 */
export const toolPageCardNarrow = 'w-full max-w-lg'

/**
 * Centered card width for ECDH result (two key panels + env block).
 */
export const toolPageCardWide = 'w-full max-w-4xl'

/** Page title on tool screens (aligned with doc h2 token rhythm). */
export const toolPageTitle = `text-center ${appUi.pageTitle}`

/** Body copy under tool titles. */
export const toolPageLead = `text-center ${appUi.lead} sm:max-w-md sm:mx-auto`

/** Primary CTA: same intent as doc btnPrimary, fixed touch height. */
export const toolBtnPrimary = `${appUi.btnPrimary} sm:w-auto`

/** Secondary outline CTA (same height as primary for visual balance). */
export const toolBtnSecondary = `${appUi.btnSecondary} sm:w-auto`
