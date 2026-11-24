import catalog from './figcraft-icons.json' with { type: 'json' }
import { brokenPaths } from './broken-paths.js'
import { studies } from './icon-study.js'
import { modernGeometry } from './modern-geometry.js'
import { beveledGeometry, brokenGeometry } from './variant-geometry.js'

export const icons = catalog.icons.map((icon) => ({ ...icon, slug: icon.name }))
export const categories = Array.from(Map.groupBy(icons, (icon) => icon.tab), ([tab, group]) => ({
  label: tab.replace(/^\d+\s*\/\s*/, ''),
  options: [...new Set(group.map((icon) => icon.category))],
}))
export const byName = new Map(icons.map((icon) => [icon.slug, icon]))
export const specimen = byName.get('arrow-up-right')
export const pageSize = 18

const beveledPaths = new Map([
  ...studies.map(({ slug, path }) => [slug, path]),
  ['arrow-up-right', 'M5 19 17.5 6.5M9 5h7l3 3v7'],
  ['chevron-right', 'M8 5l5.75 5.75v2.5L8 19'],
  ['chevron-left', 'M16 5l-5.75 5.75v2.5L16 19'],
  ['chevron-up', 'M5 16l5.75-5.75h2.5L19 16'],
  ['chevron-down', 'M5 8l5.75 5.75h2.5L19 8'],
  ['more-horizontal', 'M4 12l1-1m6.5 1 1-1m6.5 1 1-1'],
  ['more-vertical', 'M12 4l1 1m-1 6.5 1 1m-1 6.5 1 1'],
  ['grip', 'M8 6l1-1m5 1 1-1m-7 7 1-1m5 1 1-1m-7 7 1-1m5 1 1-1'],
  ['loader', 'M12 4v2l1 1m4.66-.66-1.41 1.41v1.4M20 12h-2l-1 1m.66 4.66-1.41-1.41h-1.4M12 20v-2l-1-1m-4.66.66 1.41-1.41v-1.4M4 12h2l1-1m-.66-4.66 1.41 1.41h1.4'],
])
const variants = new Map()
export const iconStyles = [
  { id: 'outline', label: 'Outline' },
  { id: 'bold', label: 'Bold' },
  { id: 'broken', label: 'Broken' },
  { id: 'potong-serong', label: 'Potong Serong' },
  { id: 'tipis', label: 'Tipis' },
  { id: 'bayang', label: 'Bayang' },
  { id: 'piksel', label: 'Piksel' },
]
export const styleById = new Map(iconStyles.map((style) => [style.id, style]))

function baseVariant(icon, style) {
  const broken = style === 'broken'
  const override = broken ? (Object.hasOwn(brokenPaths, icon.slug) ? brokenPaths[icon.slug] : undefined) : beveledPaths.get(icon.slug)
  const path = override ?? (broken ? brokenGeometry(icon.path) : beveledGeometry(icon.path))
  return { path, x: override ? 0 : icon.x, y: override ? 0 : icon.y }
}

export function withStyle(icon, style = 'outline') {
  if (!icon || !styleById.has(style)) return null
  if (style === 'outline') return { ...icon, style, weight: 2 }
  const key = `${style}:${icon.slug}`
  if (!variants.has(key)) variants.set(key, { ...icon, style, layers: modernGeometry(icon, style, baseVariant) })
  return variants.get(key)
}

export const iconLayers = (icon) => icon.layers ?? [{ path: icon.path, x: icon.x, y: icon.y, weight: icon.weight ?? 2 }]

export const fileNameFor = (icon) => `${icon.slug}${icon.style && icon.style !== 'outline' ? `-${icon.style}` : ''}.svg`

const synonyms = [
  'home rumah beranda', 'search cari pencarian find', 'user person profile pengguna orang akun profil',
  'arrow panah', 'diagonal serong', 'right kanan', 'left kiri', 'up atas naik', 'down bawah turun',
  'camera kamera foto photo', 'image gambar picture foto', 'mail email surat', 'chat percakapan pesan message',
  'star bintang', 'heart hati suka favorit', 'plus tambah add', 'close tutup silang', 'check centang',
  'download unduh', 'upload unggah', 'copy salin', 'link tautan', 'trash delete hapus sampah',
  'filter saring', 'sort urut', 'play putar', 'pause jeda', 'speaker sound suara volume',
  'live langsung siaran', 'event acara', 'workshop lokakarya', 'calendar kalender', 'ticket tiket',
  'lock kunci gembok', 'pin location lokasi', 'layers lapis susun', 'crop pangkas potong',
  'bookmark tandai simpan', 'setting settings pengaturan setelan', 'bag tas', 'cart keranjang',
]
const aliases = new Map()
for (const line of synonyms) {
  const words = line.split(' ')
  for (const word of words) {
    const related = aliases.get(word) ?? new Set()
    for (const other of words) if (word !== other) related.add(other)
    aliases.set(word, related)
  }
}

const normalize = (text) => text.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, ' ').trim()
const index = icons.map((icon) => ({
  icon,
  name: normalize(icon.name),
  meta: normalize(`${icon.category} ${icon.tab} ${[icon.keywords].flat().filter(Boolean).join(' ')}`),
  words: new Set(normalize(icon.name).split(' ')),
}))

export function searchIcons(query, category, style = 'outline') {
  const phrase = normalize(query)
  const terms = phrase ? phrase.split(' ') : []
  return index.flatMap(({ icon, name, meta, words }) => {
    if (category && icon.category !== category) return []
    let score = name === phrase ? 100 : name.startsWith(`${phrase} `) ? 25 : 0
    for (const term of terms) {
      if (words.has(term)) score += 18
      else if (name.includes(term)) score += 10
      else if ([...(aliases.get(term) ?? [])].some((alias) => words.has(alias))) score += 6
      else if (meta.includes(term)) score += 3
      else return []
    }
    return [{ icon, score }]
  }).sort((a, b) => b.score - a.score).map(({ icon }) => withStyle(icon, style))
}

export const translate = (icon) => `translate(${icon.x} ${icon.y})`

// The catalog, inspector and all exporters use the same paints and path order.
export function iconPresentation(icon, color = 'currentColor') {
  const frame = { fill: 'none', stroke: color, strokeWidth: icon.weight ?? 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
  const paths = iconLayers(icon).map((layer) => {
    const geometry = { d: layer.path, transform: translate(layer) }
    if (!icon.layers) return geometry
    return {
      ...geometry,
      ...(layer.weight ? { strokeWidth: layer.weight, strokeLinejoin: layer.strokeJoin ?? 'round' } : { fill: color, stroke: 'none' }),
      ...(layer.evenOdd ? { fillRule: 'evenodd' } : {}),
      ...(layer.opacity == null ? {} : { opacity: layer.opacity }),
    }
  })
  return { frame, paths }
}

function attributes(props, jsx) {
  return Object.entries(props).map(([key, value]) => {
    const name = jsx ? key : key.replace(/^(stroke|fill)([A-Z])/, (_, prefix, letter) => `${prefix}-${letter.toLowerCase()}`)
    return `${name}=${jsx && typeof value === 'number' ? `{${value}}` : JSON.stringify(String(value))}`
  }).join(' ')
}

function markup(icon, size, color, jsx) {
  const { frame, paths } = iconPresentation(icon, color)
  const dimensions = attributes({ width: size, height: size, viewBox: '0 0 24 24' }, jsx)
  const children = paths.map((path) => `  <path ${attributes(path, jsx)} />`).join('\n')
  return `<svg${jsx ? '' : ' xmlns="http://www.w3.org/2000/svg"'} ${dimensions}\n  ${attributes(frame, jsx)} aria-hidden="true">\n${children}\n</svg>`
}

export const svgMarkup = (icon, size, color) => markup(icon, size, color, false)
export const jsxMarkup = (icon, size, color) => markup(icon, size, color, true)

export const uiPaths = {
  close: 'M5 3 L12 10 L19 3 L21 5 L14 12 L21 19 L19 21 L12 14 L5 21 L3 19 L10 12 L3 5 Z',
  chevron: 'M5 8 L12 15 L19 8 L21 10 L12 19 L3 10 Z',
  prev: 'M15 4 L7 12 L15 20 L17 18 L11 12 L17 6 Z',
  next: 'M9 4 L17 12 L9 20 L7 18 L13 12 L7 6 Z',
  download: 'M10 2 L14 2 L14 11 L17 8 L20 11 L12 19 L4 11 L7 8 L10 11 Z M3 20 L21 20 L21 23 L3 23 Z',
  copy: 'M8 8 L22 8 L22 22 L8 22 Z M11 11 L11 19 L19 19 L19 11 Z M2 2 L16 2 L16 5 L5 5 L5 16 L2 16 Z',
  search: 'M4 5 L14 3 L20 9 L18 15 L22 19 L19 22 L14 17 L8 19 L2 13 Z M7 8 L6 12 L9 15 L14 14 L16 10 L13 7 Z',
  arrow: 'M3 14 L8 14 L14 8 L9 8 L9 4 L21 4 L21 16 L17 16 L17 11 L10 18 L3 18 Z',
  back: 'M3 11 L10 4 L13 7 L9 11 L16 11 L21 16 L21 20 L17 20 L17 17 L15 15 L9 15 L13 19 L10 22 L3 15 Z',
}
