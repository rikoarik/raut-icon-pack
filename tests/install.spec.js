import { readFile } from 'node:fs/promises'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { assetUrl, cliCommand, files, gitUrl, mavenUrl, releaseUrl, version } from '../src/releases.js'

for (const width of [320, 768, 1440]) {
  for (const language of ['id', 'en']) {
    test(`installation layout and commands at ${width}px (${language})`, async ({ page, context }) => {
      const english = language === 'en'
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      await page.setViewportSize({ width, height: 820 })
      await page.goto(`/?lang=${language}`)
      await page.getByRole('link', { name: english ? 'Install' : 'Instalasi', exact: true }).click()
      expect(new URL(page.url()).pathname).toBe('/instalasi/')
      await expect(page.getByRole('heading', { name: english ? 'Install RAUT.' : 'Pasang library.' })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
      expect(await page.getByRole('link', { name: english ? /^Download / : /^Unduh / }).evaluateAll(links => links.map(link => link.href).sort())).toEqual(Object.keys(files).map(assetUrl).sort())
      await expect(page.getByRole('link', { name: english ? 'View GitHub release' : 'Lihat rilis GitHub' })).toHaveAttribute('href', releaseUrl)
      await expect(page.locator('pre').filter({ hasText: mavenUrl })).toHaveCount(1)
      await expect(page.locator('pre').filter({ hasText: `dev.roundedicons:rounded-icons-android:${version}` })).toHaveCount(1)
      await expect(page.locator('pre').filter({ hasText: gitUrl })).toHaveCount(2)
      await page.getByRole('link', { name: 'CLI / npx' }).click()
      await expect(page).toHaveURL(/#cli$/)
      const cli = page.getByRole('region', { name: 'CLI / npx' })
      await cli.getByRole('button', { name: `${english ? 'Copy' : 'Salin'} Terminal · CLI`, exact: true }).click()
      await expect(cli.getByRole('status').filter({ hasText: english ? /^Copied$/ : /^Tersalin$/ })).toHaveCount(1)
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${cliCommand} list arrow\n${cliCommand} add home --out ./public/icons`)
    })
  }
}

test('offline archives are still served byte for byte', async ({ request }) => {
  for (const file of Object.values(files)) {
    const response = await request.get(`/library/${file}`)
    expect(response.ok()).toBe(true)
    expect((await response.body()).equals(await readFile(new URL(`../public/library/${file}`, import.meta.url))), file).toBe(true)
  }
})
