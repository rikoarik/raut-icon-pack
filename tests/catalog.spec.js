import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { byName, iconLayers, icons, iconStyles, jsxMarkup, pageSize, searchIcons, svgMarkup, translate, withStyle } from '../src/icons.js'

for (const [width, height] of [[320, 690], [375, 812], [768, 900], [1366, 768], [1440, 900]]) {
  test(`catalog and empty-state recovery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const cards = page.getByRole('button', { name: /^Inspeksi ikon / })
    const field = page.getByRole('searchbox', { name: 'Cari ikon' })
    const filter = page.getByRole('list', { name: 'Kategori' })
    await expect(cards).toHaveCount(pageSize)
    await expect(page.getByRole('status')).toHaveText('1–18 dari 612 ikon')
    const paging = page.getByRole('navigation', { name: 'Halaman katalog' })
    for (const control of [field, filter, cards.last(), paging]) {
      const box = await control.boundingBox()
      expect(box.y + box.height).toBeLessThanOrEqual(height)
    }
    for (const control of await filter.getByRole('button').or(paging.getByRole('button')).all()) {
      const box = await control.boundingBox()
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
    await expect(page.getByRole('combobox')).toHaveCount(0)
    const documentSize = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }))
    expect(documentSize.width).toBeLessThanOrEqual(width)
    expect(documentSize.height).toBeLessThanOrEqual(height)
    await page.keyboard.press('/')
    await expect(field).toBeFocused()
    const media = filter.getByRole('button', { name: 'Media', exact: true })
    await media.click()
    await expect(media).toHaveAttribute('aria-pressed', 'true')
    await field.fill('kamera')
    await expect(cards.first()).toHaveAccessibleName('Inspeksi ikon camera')
    await field.fill('kamerra')
    await expect(page.getByText('Tidak ada ikon untuk “kamerra”')).toBeVisible()
    const reset = page.getByRole('button', { name: 'Hapus pencarian', exact: true })
    if (width <= 375) await expect(reset).toBeInViewport()
    await reset.click()
    await expect(cards).toHaveCount(18)
    await expect(field).toBeFocused()
    expect(errors).toEqual([])
  })
}

test('pagination reaches the full collection without changing master geometry', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const tiles = page.getByRole('button', { name: /^Inspeksi ikon / })
  const paging = page.getByRole('navigation', { name: 'Halaman katalog' })
  const next = paging.getByRole('button', { name: 'Halaman berikutnya' })
  const nextPosition = (await next.boundingBox()).x
  for (let index = 0; index < icons.length / pageSize; index++) {
    if (index) await next.click()
    await expect(paging.getByRole('button', { name: `Halaman ${index + 1}`, exact: true })).toHaveAttribute('aria-current', 'page')
    const expected = icons.slice(index * pageSize, (index + 1) * pageSize)
    const shapes = await tiles.locator('path').evaluateAll((nodes) => nodes.map((node) => [node.getAttribute('d'), node.getAttribute('transform'), node.ownerSVGElement.getAttribute('stroke-width')]))
    expect(shapes).toEqual(expected.map((icon) => [icon.path, translate(icon), '2']))
    await expect(paging).toBeInViewport()
    expect((await next.boundingBox()).x).toBe(nextPosition)
  }
  await expect(next).toBeDisabled()
  await expect(tiles.last()).toHaveAccessibleName('Inspeksi ikon event-workshop')
  await paging.getByRole('button', { name: 'Halaman sebelumnya' }).click()
  await expect(paging.getByRole('button', { name: 'Halaman 33', exact: true })).toHaveAttribute('aria-current', 'page')
  await paging.getByRole('button', { name: 'Halaman 1', exact: true }).click()
  await expect(tiles.first()).toHaveAccessibleName('Inspeksi ikon home')
  await paging.getByRole('button', { name: 'Halaman 34', exact: true }).click()
  await expect(tiles.last()).toHaveAccessibleName('Inspeksi ikon event-workshop')
  await page.getByRole('searchbox').fill('event-workshop')
  await expect(tiles).toHaveCount(1)
})

test('category index exposes all 51 options and restores focus on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 690 })
  await page.goto('/')
  const shortcuts = page.getByRole('list', { name: 'Kategori' })
  const open = shortcuts.getByRole('button', { name: /51 kategori/ })
  const index = page.getByRole('dialog', { name: 'Semua kategori' })
  const search = index.getByRole('searchbox', { name: 'Cari kategori' })
  await open.focus()
  await page.keyboard.press('Enter')
  await expect(search).toBeFocused()
  await expect(index.locator('.category-index-list').getByRole('button')).toHaveCount(51)
  await search.fill('xyz-999')
  await expect(index.getByRole('status')).toHaveText('Tidak ada kategori yang cocok.')
  await index.getByRole('button', { name: 'Hapus pencarian kategori' }).click()
  await expect(search).toBeFocused()
  await search.fill('acara')
  const events = index.getByRole('button', { name: 'Tempat, jadwal & kursi', exact: true })
  await events.focus()
  await page.keyboard.press('Space')
  await expect(index).toBeHidden()
  await expect(open).toBeFocused()
  await expect(page.getByRole('heading', { name: 'Tempat, jadwal & kursi' })).toBeVisible()
  await open.click()
  await expect(search).toHaveValue('')
  await expect(events).toHaveAttribute('aria-pressed', 'true')
  await page.keyboard.press('Escape')
  await expect(index).toBeHidden()
  await expect(open).toBeFocused()
  await shortcuts.getByRole('button', { name: 'Semua ikon' }).click()
  await expect(page.getByRole('status')).toHaveText('1–18 dari 612 ikon')
})

test('sticky header on a short viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 500 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: /^Inspeksi ikon / })).toHaveCount(pageSize)
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  expect((await page.locator('.masthead').boundingBox()).y).toBe(0)
  await page.getByRole('link', { name: 'Katalog', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport()
})

test('specimen is still at rest and honors live reduced-motion preferences', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/')
  const specimen = page.getByRole('button', { name: 'Buka spesimen arrow-up-right' })
  const band = page.locator('.specimen-frame .glare-hover__band')
  const position = () => band.evaluate((node) => node.style.transform)
  await expect.poll(position).not.toBe('')
  const resting = await position()
  await specimen.hover()
  await expect.poll(position).not.toBe(resting)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.specimen-frame .glare-hover__glare')).toBeHidden()
  await specimen.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog', { name: 'arrow-up-right' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(specimen).toBeFocused()
})

test('compact specimen and style picker remain usable by touch', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 690 }, hasTouch: true, isMobile: true })
  try {
    const page = await context.newPage()
    await page.goto('/')
    const picker = page.getByRole('button', { name: /^Gaya ikon / })
    await picker.tap()
    await page.getByRole('dialog', { name: 'Pilih gaya ikon' }).getByRole('button', { name: 'Piksel' }).tap()
    await expect(picker).toHaveAccessibleName('Gaya ikon Piksel')
    await expect(page.locator('.specimen-frame .glare-hover__glare')).toBeHidden()
    await page.getByRole('button', { name: 'Buka spesimen arrow-up-right' }).tap()
    await expect(page.getByRole('dialog', { name: 'arrow-up-right' })).toBeVisible()
    await expect(page).toHaveURL(/\?gaya=piksel&ikon=arrow-up-right$/)
  } finally {
    await context.close()
  }
})

test('inspector supports keyboard, settings, SVG download, and JSX copy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  const tile = page.getByRole('button', { name: 'Inspeksi ikon arrow-up-right', exact: true })
  await page.getByRole('searchbox').fill('arrow-up-right')
  await tile.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog', { name: 'arrow-up-right' })
  const close = dialog.getByRole('button', { name: 'Tutup inspeksi' })
  await expect(close).toBeFocused()
  await expect(page).toHaveURL(/\?ikon=arrow-up-right$/)
  await dialog.getByRole('slider', { name: 'Ukuran' }).fill('64')
  await dialog.getByRole('button', { name: 'Gelap' }).click()
  await dialog.getByRole('textbox', { name: 'Warna ikon', exact: true }).fill('#FFEEDD')
  const format = dialog.getByRole('group', { name: 'Cuplikan kode' })
  const react = format.getByRole('button', { name: 'React' })
  await expect(format.getByRole('button', { name: 'SVG' })).toHaveAttribute('aria-pressed', 'true')
  await react.focus()
  await page.keyboard.press('Space')
  await expect(react).toHaveAttribute('aria-pressed', 'true')
  await expect(dialog.getByRole('combobox')).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Salin kode' }).click()
  await expect(dialog.getByText('Kode disalin.')).toBeVisible()
  const clipboard = await page.evaluate(() => navigator.clipboard.readText())
  expect(clipboard).toContain('width={64}')
  expect(clipboard).toContain(`d="${byName.get('arrow-up-right').path}"`)
  expect(clipboard).toContain('strokeWidth={2}')
  expect(clipboard).toContain('stroke="#FFEEDD"')
  const downloadPromise = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Unduh SVG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('arrow-up-right.svg')
  const svg = await readFile(await download.path(), 'utf8')
  expect(svg).toContain('viewBox="0 0 24 24"')
  expect(svg).toContain('width="64"')
  expect(svg).toContain(`transform="${translate(byName.get('arrow-up-right'))}"`)
  expect(svg).toContain('stroke="#FFEEDD"')
  expect(svg).toContain('stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(tile).toBeFocused()
  await expect(page).toHaveURL(/\/$/)
  await page.goto('/?ikon=camera')
  await expect(page.getByRole('dialog', { name: 'camera' })).toBeVisible()
})

test('variant layers match the approved FigCraft modern-1 revision', () => {
  // Digests from the 19 FigCraft boards’ source payloads, in catalog order.
  const expected = {
    bold: '7b798afc073b36057bc301676bfe59eab9af161b1676af8c37cbd29a4d6b5b64',
    broken: '797eab2a666f9236e439c7c37ddedaca4eaa7599b814fa85d6256b162a6ab6fd',
    'potong-serong': '9a2b9abae506304be27a9812945772f2cd6f39603c8593678a0b737a3cf2e9f4',
    tipis: 'c5d9ff63516938535f815a70d707e40416dfbb7b992067b57e052cc88e96cf0f',
    bayang: 'f2037e506b9a922db6eb97013d591e0af52a00b2795438a256411796059e8abe',
    piksel: '8a00a38ffb740bb43af234f42d55a4a3e06c2ddbba8c16aa3fd313e1f6c377af',
  }
  for (const [style, digest] of Object.entries(expected)) {
    const rows = icons.map((icon) => [icon.slug, iconLayers(withStyle(icon, style)).map(
      ({ path, x, y, weight, strokeJoin = 'round', opacity = 1, evenOdd = false }) => [path, x, y, weight, strokeJoin, opacity, evenOdd],
    )])
    expect(createHash('sha256').update(JSON.stringify(rows)).digest('hex'), style).toBe(digest)
  }
})

test('all 612 icons have seven distinct, valid variants inside the SVG grid', async ({ page }) => {
  const slugs = icons.map(({ slug }) => slug)
  const variants = iconStyles.flatMap(({ id }) => {
    const collection = searchIcons('', '', id)
    expect(collection.map(({ slug }) => slug)).toEqual(slugs)
    return collection
  })
  expect(variants).toHaveLength(4284)
  for (const master of icons) {
    const signatures = iconStyles.map(({ id }) => svgMarkup(withStyle(master, id), 24, 'currentColor'))
    expect(new Set(signatures).size, master.slug).toBe(7)
  }
  const invalid = await page.evaluate((items) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const path = document.createElementNS(svg.namespaceURI, 'path')
    svg.append(path)
    document.body.append(svg)
    return items.flatMap(({ label, layers }) => layers.flatMap((layer) => {
      path.setAttribute('d', layer.path)
      const { x, y, width, height } = path.getBBox()
      const stroke = layer.weight / 2
      const x0 = x + layer.x, y0 = y + layer.y
      const fits = x0 - stroke >= -.001 && y0 - stroke >= -.001 && x0 + width + stroke <= 24.001 && y0 + height + stroke <= 24.001
      return path.getTotalLength() > 0 && fits ? [] : [label]
    }))
  }, variants.map((icon) => ({ label: `${icon.style}/${icon.slug}`, layers: iconLayers(icon) })))
  expect(invalid).toEqual([])
})

test('style picker applies variants in the catalog, deep links and exports', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 690 })
  await page.goto('/studi-ikon/')
  await expect(page).toHaveURL(/\?gaya=potong-serong$/)
  const picker = page.getByRole('group', { name: 'Gaya ikon' })
  const trigger = picker.getByRole('button', { name: /^Gaya ikon / })
  const styles = page.getByRole('dialog', { name: 'Pilih gaya ikon' })
  async function choose(name) {
    await trigger.click()
    await styles.getByRole('button', { name, exact: true }).click()
    await expect(trigger).toBeFocused()
  }
  const pathFor = (slug, style) => iconLayers(withStyle(byName.get(slug), style))[0].path
  const home = page.getByRole('button', { name: 'Inspeksi ikon home', exact: true })
  await expect(page.getByRole('link', { name: 'Studi ikon' })).toHaveCount(0)
  await expect(trigger).toHaveAccessibleName('Gaya ikon Potong Serong')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(styles.getByRole('button', { name: 'Potong Serong' })).toBeFocused()
  await expect(styles.locator('li')).toHaveCount(7)
  await page.keyboard.press('Escape')
  await expect(trigger).toBeFocused()
  await expect(page.getByRole('status')).toHaveText('1–18 dari 612 ikon')
  await expect(home.locator('path')).toHaveAttribute('d', pathFor('home', 'potong-serong'))
  await home.click()
  const dialog = page.getByRole('dialog', { name: 'home' })
  const downloadPromise = page.waitForEvent('download')
  await dialog.getByRole('button', { name: 'Unduh SVG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toBe('home-potong-serong.svg')
  expect(await readFile(await download.path(), 'utf8')).toBe(svgMarkup(withStyle(byName.get('home'), 'potong-serong'), 48, '#131C2D'))
  await page.reload()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  const search = page.getByRole('searchbox', { name: 'Cari ikon' })
  await search.fill('event-workshop')
  const workshop = page.getByRole('button', { name: 'Inspeksi ikon event-workshop' })
  for (const { id, label } of iconStyles) {
    await choose(label)
    await expect(trigger).toHaveAccessibleName(`Gaya ikon ${label}`)
    await expect(search).toHaveValue('event-workshop')
    await expect(workshop.locator('path').first()).toHaveAttribute('d', pathFor('event-workshop', id))
    if (id !== 'outline') await expect(page).toHaveURL(new RegExp(`\\?gaya=${id}$`))
  }
  await search.clear()
  await expect(page.getByRole('status')).toHaveText('1–18 dari 612 ikon')
})

test('desktop style buttons and layered exports agree with the preview', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.setViewportSize({ width: 1366, height: 768 })
  await page.goto('/')
  const picker = page.getByRole('group', { name: 'Gaya ikon' })
  await expect(picker.getByRole('button')).toHaveCount(7)
  await picker.getByRole('button', { name: 'Bayang' }).click()
  await expect(page).toHaveURL(/\?gaya=bayang$/)
  const color = '#4466AA'
  const size = 16
  for (const { id, label } of iconStyles) {
    await page.goto(`/?gaya=${id}&ikon=camera`)
    const dialog = page.getByRole('dialog', { name: 'camera' })
    const icon = withStyle(byName.get('camera'), id)
    await expect(dialog.getByText(` / ${label} / `, { exact: false })).toBeVisible()
    await dialog.getByRole('slider', { name: 'Ukuran' }).fill(String(size))
    await dialog.getByRole('textbox', { name: 'Warna ikon', exact: true }).fill(color)
    const preview = dialog.locator('.inspect-grid svg')
    await expect(preview).toHaveAttribute('width', String(size))
    await expect(preview.locator('path')).toHaveCount(iconLayers(icon).length)
    const svg = svgMarkup(icon, size, color)
    const livePaths = await preview.locator('path').evaluateAll((paths, markup) => {
      const entries = (node) => Object.fromEntries(Array.from(node.attributes, ({ name, value }) => [name, value]))
      const expected = new DOMParser().parseFromString(markup, 'image/svg+xml')
      return [paths.map(entries), Array.from(expected.querySelectorAll('path'), entries).map((props) => Object.fromEntries(
        Object.entries(props).map(([key, value]) => [key, value === '#4466AA' ? 'currentColor' : value]),
      ))]
    }, svg)
    expect(livePaths[0], id).toEqual(livePaths[1])
    await expect(dialog.locator('code')).toHaveText(svg)
    const pending = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Unduh SVG' }).click()
    const download = await pending
    expect(download.suggestedFilename()).toBe(`camera${id === 'outline' ? '' : `-${id}`}.svg`)
    expect(await readFile(await download.path(), 'utf8')).toBe(svg)
    await dialog.getByRole('button', { name: 'React' }).click()
    await dialog.getByRole('button', { name: 'Salin kode' }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(jsxMarkup(icon, size, color))
  }
})

test('guide, 404, and automated accessibility checks', async ({ page }) => {
  await page.goto('/')
  const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
  expect((await scan()).violations).toEqual([])
  await page.getByRole('button', { name: /51 kategori/ }).click()
  expect((await scan()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Buka spesimen arrow-up-right' }).click()
  expect((await scan()).violations).toEqual([])
  await page.keyboard.press('Escape')
  await page.getByRole('link', { name: 'Panduan', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Panduan penggunaan/ })).toBeVisible()
  await page.goto('/404.html')
  await expect(page.getByRole('heading', { name: 'Salah arah.' })).toBeVisible()
  await page.getByRole('link', { name: 'Kembali ke katalog' }).click()
  await expect(page.getByRole('heading', { name: 'Katalog ikon' })).toBeVisible()
})
