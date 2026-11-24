import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const [width, height] of [[320, 690], [375, 812], [768, 900], [1366, 768], [1440, 900]]) {
  test(`English catalog fits at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    await page.goto('/?lang=en')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('heading', { name: 'Icons for interfaces.' })).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([width, height])
    await expect(page.getByRole('button', { name: /^Inspect icon / })).toHaveCount(18)
  })
}

for (const width of [320, 768, 1440]) {
  test(`bilingual guide and inspector at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 820 })
    await page.goto('/panduan/')
    for (const [lang, title] of [['id', 'Panduan penggunaan.'], ['en', 'Usage guide.']]) {
      await expect(page.locator('html')).toHaveAttribute('lang', lang)
      await expect(page.getByRole('heading', { name: title })).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([])
      if (lang === 'id') await page.getByRole('link', { name: 'English', exact: true }).click()
    }
    await expect(page.getByText('Choose Download SVG', { exact: false })).toBeVisible()
    await page.getByRole('link', { name: 'Try in inspector' }).click()
    await expect(page.getByRole('dialog', { name: 'search' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Download SVG' })).toBeVisible()
    await page.keyboard.press('Escape')
    await page.goto('/?gaya=piksel')
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
    await expect(page.getByRole('button', { name: /Pixel/ }).filter({ visible: true })).toBeVisible()
    await page.getByRole('link', { name: 'Bahasa Indonesia', exact: true }).click()
    await expect(page.locator('html')).toHaveAttribute('lang', 'id')
    expect(new URL(page.url()).searchParams.get('gaya')).toBe('piksel')
    await expect(page.getByRole('button', { name: /Piksel/ }).filter({ visible: true })).toBeVisible()
  })
}

test('changing language preserves installation deep links', async ({ page }) => {
  await page.goto('/instalasi/#mobile')
  await page.getByRole('link', { name: 'English', exact: true }).click()
  await expect(page).toHaveURL(/\/instalasi\/\?lang=en#mobile$/)
  await expect(page.getByRole('heading', { name: 'Mobile & native desktop' })).toBeInViewport()
})
