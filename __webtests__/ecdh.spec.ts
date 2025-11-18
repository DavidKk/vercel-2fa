import { expect, test } from '@playwright/test'

test.describe('ECDH key generation page', () => {
  test('generates key pair and displays results', async ({ page }) => {
    await page.goto('/ecdh')

    await expect(page.getByRole('heading', { name: 'Generate ECDH Key Pair' })).toBeVisible()

    await page.getByRole('button', { name: 'Generate Key Pair' }).click()

    await expect(page.getByRole('heading', { name: 'ECDH Key Pair Generated Successfully!' })).toBeVisible()

    const privateKeyCode = page.locator('code').filter({ hasText: 'BEGIN PRIVATE KEY' }).first()
    await expect(privateKeyCode).toContainText('BEGIN PRIVATE KEY')

    const publicKeyCode = page.locator('code').filter({ hasText: 'BEGIN PUBLIC KEY' }).first()
    await expect(publicKeyCode).toContainText('BEGIN PUBLIC KEY')

    const base64Code = page.locator('div').filter({ hasText: 'Public Key (Base64 SPKI Format)' }).locator('code').first()

    const base64Text = await base64Code.innerText()
    expect(base64Text.length).toBeGreaterThan(50)

    const envExample = page.locator('.bg-indigo-50 code', { hasText: 'NEXT_PUBLIC_ECDH_SERVER_PUBLIC_KEY' }).first()
    await expect(envExample).toBeVisible()
  })
})
