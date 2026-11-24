/* oxlint-disable react/only-export-components -- This file is the application entry point. */
import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/source-sans-3'
import '@fontsource/ibm-plex-mono/latin-400.css'
import { byName, categories, fileNameFor, iconPresentation, icons, iconStyles, jsxMarkup, pageSize, searchIcons, specimen, styleById, svgMarkup, uiPaths, withStyle } from './icons.js'
import GlareHover from './components/GlareHover.jsx'
import { categoryLabel, language, languageUrl, localizePageMetadata, pageUrl, styleLabel, t } from './i18n.js'
import './styles.css'
import './catalog.css'
import './guide.css'
import { Install } from './install.jsx'

const brandPaths = [
  'M0 0H65L82 17V49L67 64L86 100H61L43 69H23V100H0Z M23 21V48H55L59 44V25L55 21Z',
  'M29 0H57L86 100H62L56 77H29L23 100H0Z M34 57H51L43 25Z',
  'M0 0H23V72L29 80H56L62 72V0H85V79L67 100H18L0 79Z',
  'M0 0H88V22H56V100H32V22H0Z',
]
const validColor = /^#[\da-f]{6}$/i
const defaultColor = '#131C2D'
const darkColor = '#E8EEFF'

function Brand() {
  return <svg viewBox="0 0 370 100" width="74" height="20" aria-hidden="true" fill="currentColor">
    {brandPaths.map((path, index) => <path key={index} d={path} transform={`translate(${index * 94} 0)`} fillRule="evenodd" />)}
  </svg>
}

function Glyph({ path, size = 24, className }) {
  return <svg className={className} viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false">
    <path d={path} fillRule="evenodd" />
  </svg>
}

function CatalogGlyph({ icon, size = 24 }) {
  const { frame, paths } = iconPresentation(icon)
  return <svg viewBox="0 0 24 24" width={size} height={size} {...frame} aria-hidden="true" focusable="false">
    {paths.map((props, index) => <path key={index} {...props} />)}
  </svg>
}

function Header({ page }) {
  return <>
    <a className="skip" href="#main">{t('Lewati ke konten', 'Skip to content')}</a>
    <header className="masthead"><div className="shell topbar">
      <a className="brand" href={pageUrl('/')} aria-label={t('RAUT, beranda', 'RAUT, home')}><Brand /><span>{t('Pustaka ikon', 'Icon library')}</span></a>
      <nav aria-label={t('Navigasi utama', 'Main navigation')}>
        <a href={pageUrl('/')} aria-current={page === 'catalog' ? 'page' : undefined}>{t('Katalog', 'Catalog')}</a>
        <a href={pageUrl('/panduan/')} aria-current={page === 'guide' ? 'page' : undefined}>{t('Panduan', 'Guide')}</a>
        <a href={pageUrl('/instalasi/')} aria-current={page === 'install' ? 'page' : undefined}>{t('Instalasi', 'Install')}</a>
      </nav>
      <a className="language-switch" href={languageUrl(t('en', 'id'))} hrefLang={t('en', 'id')} aria-label={t('English', 'Bahasa Indonesia')}>
        <span aria-hidden="true" className={language === 'id' ? 'current-language' : undefined}>ID</span>
        <span aria-hidden="true">/</span>
        <span aria-hidden="true" className={language === 'en' ? 'current-language' : undefined}>EN</span>
      </a>
    </div></header>
  </>
}

function Footer() {
  return <footer className="shell footer"><a href={pageUrl('/')} aria-label={t('RAUT, beranda', 'RAUT, home')}><Brand /></a><span>{t('Ikon vektor orisinal', 'Original vector icons')}</span><a href={pageUrl('/panduan/')}>{t('Panduan penggunaan', 'Usage guide')}</a></footer>
}

function SpecimenDrawing({ icon, path }) {
  return <span className="plate-drawing" aria-hidden="true">
    <span className="plate-grid">{icon ? <CatalogGlyph icon={icon} size={120} /> : <Glyph path={path} size={120} />}</span>
  </span>
}

function CatalogSpecimen({ icon, onSelect }) {
  return <GlareHover className="specimen-frame" width="100%" height="100%" background="var(--blue)" borderRadius="0px" glareOpacity={0.13} glareAngle={64} glareSize={35} transitionDuration={560} playOnce rimGlint={false}>
    <button type="button" className="catalog-specimen" onClick={(event) => onSelect(icon, event.currentTarget)} aria-label={`${t('Buka spesimen', 'Open specimen')} ${icon.slug}`}>
      <span className="plate-meta" aria-hidden="true"><span>{t('Spesimen', 'Specimen')} / {styleLabel(styleById.get(icon.style))}</span><strong>{icon.slug}</strong><span className="plate-action">{t('Inspeksi ikon', 'Inspect icon')} <Glyph path={uiPaths.next} size={14} /></span></span>
      <SpecimenDrawing icon={icon} />
      <span className="plate-samples" aria-hidden="true"><SizeStrip icon={icon} /></span>
      <span className="plate-mobile-arrow" aria-hidden="true"><Glyph path={uiPaths.next} size={14} /></span>
    </button>
  </GlareHover>
}

function SizeStrip({ icon }) {
  return <span className="sizes">
    {[16, 24, 32].map((size) => <span className="size-sample" key={size}><span className="size-glyph"><CatalogGlyph icon={icon} size={size} /></span><small>{size} px</small></span>)}
  </span>
}

function Inspector({ icon, onClose }) {
  const dialog = useRef(null)
  const codeRef = useRef(null)
  const [size, setSize] = useState(48)
  const [color, setColor] = useState(defaultColor)
  const [draft, setDraft] = useState(defaultColor)
  const [dark, setDark] = useState(false)
  const [format, setFormat] = useState('svg')
  const [feedback, setFeedback] = useState('')
  const code = (format === 'svg' ? svgMarkup : jsxMarkup)(icon, size, color)

  useEffect(() => {
    const node = dialog.current
    node.showModal()
    return () => node.close()
  }, [])

  function changeColor(value) {
    setDraft(value)
    if (validColor.test(value)) setColor(value.toUpperCase())
    setFeedback('')
  }

  function changeBackdrop(nextDark) {
    setDark(nextDark)
    if (nextDark && color === defaultColor) changeColor(darkColor)
    if (!nextDark && color === darkColor) changeColor(defaultColor)
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setFeedback(t('Kode disalin.', 'Code copied.'))
    } catch {
      codeRef.current.focus()
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(codeRef.current)
      selection.removeAllRanges()
      selection.addRange(range)
      setFeedback(t('Kode dipilih. Salin dengan pintasan perangkatmu.', 'Code selected. Copy it with your device shortcut.'))
    }
  }

  function downloadSvg() {
    const url = URL.createObjectURL(new Blob([svgMarkup(icon, size, color)], { type: 'image/svg+xml' }))
    const link = document.createElement('a')
    link.href = url
    link.download = fileNameFor(icon)
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setFeedback(t('Unduhan SVG dimulai.', 'SVG download started.'))
  }

  return <dialog ref={dialog} className="inspector" aria-labelledby="inspector-title" onCancel={(event) => { event.preventDefault(); onClose() }} onClick={(event) => { if (event.target === dialog.current) onClose() }}>
    <article className="inspector-body">
      <header className="inspector-heading">
        <div><p className="icon-meta">{categoryLabel(icon.category)} / {styleLabel(styleById.get(icon.style) ?? styleById.get('outline'))} / 24 × 24</p><h2 id="inspector-title">{icon.slug}</h2></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label={t('Tutup inspeksi', 'Close inspector')} autoFocus><Glyph path={uiPaths.close} size={18} /></button>
      </header>
      <div className="inspector-columns">
        <div className={`inspect-stage${dark ? ' inspect-stage-dark' : ''}`}>
          <div className="measure"><span>Grid 24 × 24</span><span>{size} px</span></div>
          <div className="inspect-grid" style={{ color }}><CatalogGlyph icon={icon} size={size} /></div>
          <SizeStrip icon={icon} />
        </div>
        <div className="controls">
          <div className="range-row"><label htmlFor="size">{t('Ukuran', 'Size')}</label><input id="size" type="range" min="12" max="120" value={size} onChange={(event) => { setSize(Number(event.target.value)); setFeedback('') }} /><output htmlFor="size">{size} px</output></div>
          <div className="appearance">
            <div className="color-control"><label htmlFor="hex">{t('Warna ikon', 'Icon color')}</label><div className="color-input"><input aria-label={t('Pilih warna ikon', 'Choose icon color')} type="color" value={color} onChange={(event) => changeColor(event.target.value)} /><input id="hex" value={draft} spellCheck={false} maxLength={7} onBlur={() => { if (!validColor.test(draft)) setDraft(color) }} onChange={(event) => changeColor(event.target.value)} /></div></div>
            <div className="backdrop-control"><span id="backdrop-label">{t('Latar pratinjau', 'Preview background')}</span><div className="segment" role="group" aria-labelledby="backdrop-label"><button type="button" aria-pressed={!dark} onClick={() => changeBackdrop(false)}>{t('Terang', 'Light')}</button><button type="button" aria-pressed={dark} onClick={() => changeBackdrop(true)}>{t('Gelap', 'Dark')}</button></div></div>
          </div>
          <div className="code-heading"><span id="code-label">{t('Cuplikan kode', 'Code snippet')}</span><div className="segment format-picker" role="group" aria-labelledby="code-label">
            {[['svg', 'SVG'], ['jsx', 'React']].map(([value, label]) => <button type="button" key={value} aria-pressed={format === value} onClick={() => { setFormat(value); setFeedback('') }}>{label}</button>)}
          </div></div>
          <pre role="region" aria-label={t('Kode ikon', 'Icon code')} ref={codeRef} tabIndex={0}><code>{code}</code></pre>
          <div className="exports"><button type="button" className="button primary" onClick={downloadSvg}><Glyph path={uiPaths.download} size={18} /> {t('Unduh SVG', 'Download SVG')}</button><button type="button" className="button secondary" onClick={copyCode}><Glyph path={uiPaths.copy} size={18} /> {t('Salin kode', 'Copy code')}</button></div>
          <p className="feedback" role="status">{feedback}</p>
        </div>
      </div>
    </article>
  </dialog>
}

function linkedStyle() {
  const value = new URLSearchParams(window.location.search).get('gaya')
  return styleById.has(value) ? value : 'outline'
}

function linkedIcon() {
  const name = new URLSearchParams(window.location.search).get('ikon')
  const icon = byName.get(name) ?? (name === 'arah-serong' ? specimen : name === 'kamera' ? byName.get('camera') : null)
  return withStyle(icon, linkedStyle())
}

function StylePicker({ value, onChange }) {
  const dialog = useRef(null)
  const trigger = useRef(null)
  const label = styleLabel(styleById.get(value))

  function open() {
    dialog.current.showModal()
    dialog.current.querySelector('[aria-pressed="true"]').focus()
  }

  function choose(id) {
    onChange(id)
    dialog.current.close()
  }

  return <div className="style-picker" role="group" aria-label={t('Gaya ikon', 'Icon style')}>
    <div className="style-tabs">
      {iconStyles.map(({ id, label }) => <button type="button" key={id} aria-pressed={value === id} onClick={() => onChange(id)}>{styleLabel({ id, label })}</button>)}
    </div>
    <button ref={trigger} type="button" className="style-trigger" aria-haspopup="dialog" onClick={open}>
      <span>{t('Gaya ikon', 'Icon style')}</span><strong>{label}<Glyph path={uiPaths.chevron} size={14} /></strong>
    </button>
    <dialog ref={dialog} className="inspector style-index" aria-labelledby="style-index-title" onClose={() => trigger.current.focus({ preventScroll: true })} onClick={(event) => { if (event.target === dialog.current) dialog.current.close() }}>
      <div className="style-index-body">
        <header className="category-index-heading"><h2 id="style-index-title">{t('Pilih gaya ikon', 'Choose an icon style')}</h2><button type="button" className="icon-button" aria-label={t('Tutup pilihan gaya', 'Close style picker')} onClick={() => dialog.current.close()}><Glyph path={uiPaths.close} size={17} /></button></header>
        <ul>{iconStyles.map(({ id, label }) => <li key={id}><button type="button" aria-pressed={value === id} onClick={() => choose(id)}><CatalogGlyph icon={withStyle(byName.get('camera'), id)} />{styleLabel({ id, label })}</button></li>)}</ul>
      </div>
    </dialog>
  </div>
}

const quickCategories = ['', 'Navigasi', 'Aksi', 'Media', 'Komunikasi']
const categoryTotal = categories.reduce((sum, group) => sum + group.options.length, 0)

function CategoryFilter({ value, onChange }) {
  const dialog = useRef(null)
  const search = useRef(null)
  const list = useRef(null)
  const [filter, setFilter] = useState('')
  const needle = filter.trim().toLowerCase()
  const groups = categories.map(({ label, options }) => ({
    label,
    options: options.filter((name) => `${label} ${name} ${categoryLabel(label)} ${categoryLabel(name)}`.toLowerCase().includes(needle)),
  })).filter(({ options }) => options.length)

  function openIndex() {
    setFilter('')
    dialog.current.showModal()
    list.current.scrollTop = 0
    search.current.focus()
  }

  return <div className="category-filter">
    <p id="category-label">{t('Kategori', 'Categories')}</p>
    <ul className="category-quick" aria-labelledby="category-label">
      {quickCategories.map((name) => <li key={name}><button type="button" aria-pressed={value === name} onClick={() => onChange(name)}>{name ? categoryLabel(name) : t('Semua ikon', 'All icons')}</button></li>)}
      <li><button type="button" className="category-more" data-active={Boolean(value && !quickCategories.includes(value))} data-active-compact={value === 'Komunikasi'} aria-haspopup="dialog" onClick={openIndex}>
        <span><span className="category-more-prefix">{t('Semua ', 'All ')}</span>{categoryTotal} {t('kategori', 'categories')}</span><Glyph path={uiPaths.next} size={13} />
      </button></li>
    </ul>
    <dialog className="inspector category-index" ref={dialog} aria-labelledby="category-index-title" onClick={(event) => { if (event.target === dialog.current) dialog.current.close() }}>
      <section className="category-index-body">
        <header className="category-index-heading"><h2 id="category-index-title">{t('Semua kategori', 'All categories')}</h2><button type="button" className="icon-button" aria-label={t('Tutup kategori', 'Close categories')} onClick={() => dialog.current.close()}><Glyph path={uiPaths.close} size={17} /></button></header>
        <div className="search-wrap category-search">
          <Glyph path={uiPaths.search} size={17} />
          <input ref={search} type="search" aria-label={t('Cari kategori', 'Search categories')} placeholder={t('Cari kategori', 'Search categories')} value={filter} onChange={(event) => { setFilter(event.target.value); list.current.scrollTop = 0 }} />
          {filter && <button type="button" className="icon-button clear-search" aria-label={t('Hapus pencarian kategori', 'Clear category search')} onClick={() => { setFilter(''); list.current.scrollTop = 0; search.current.focus() }}><Glyph path={uiPaths.close} size={17} /></button>}
        </div>
        <div className="category-index-list" ref={list}>
          {groups.length ? groups.map(({ label, options }) => <section className="category-index-group" key={label}>
            <h3>{categoryLabel(label)}</h3>
            <ul>{options.map((name) => <li key={name}><button type="button" aria-pressed={value === name} onClick={() => { onChange(name); dialog.current.close() }}>{categoryLabel(name)}</button></li>)}</ul>
          </section>) : <p role="status">{t('Tidak ada kategori yang cocok.', 'No matching categories.')}</p>}
        </div>
      </section>
    </dialog>
  </div>
}

function Pagination({ page, count, onChange }) {
  const center = Math.max(3, Math.min(page, count - 2))
  const numbers = count <= 5 ? Array.from({ length: count }, (_, index) => index + 1) : [1, center - 1, center, center + 1, count]
  const compact = [...new Set([1, page, count])]

  return <nav className="catalog-pagination" aria-label={t('Halaman katalog', 'Catalog pages')}>
    <button type="button" className="page-arrow" aria-label={t('Halaman sebelumnya', 'Previous page')} aria-disabled={page === 1} onClick={() => { if (page > 1) onChange(page - 1) }}><Glyph path={uiPaths.prev} size={16} /></button>
    <div className="page-track" style={{ '--page-slots': numbers.length }}>
      {numbers.map((number, index) => {
        const previous = numbers[index - 1]
        const compactIndex = compact.indexOf(number)
        const showCompact = compactIndex !== -1
        const hasCompactGap = compactIndex > 0 && number - compact[compactIndex - 1] > 1
        return <span className={`page-slot${showCompact ? '' : ' page-neighbor'}`} key={number}>
          {number - previous > 1 && <span className="page-gap page-gap-wide" aria-hidden="true">…</span>}
          {hasCompactGap && <span className="page-gap page-gap-compact" aria-hidden="true">…</span>}
          <button type="button" className="page-number" aria-label={`${t('Halaman', 'Page')} ${number}`} aria-current={number === page ? 'page' : undefined} onClick={() => onChange(number)}>{number}</button>
        </span>
      })}
    </div>
    <button type="button" className="page-arrow" aria-label={t('Halaman berikutnya', 'Next page')} aria-disabled={page === count} onClick={() => { if (page < count) onChange(page + 1) }}><Glyph path={uiPaths.next} size={16} /></button>
  </nav>
}

function Catalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage] = useState(1)
  const [style, setStyle] = useState(linkedStyle)
  const [selected, setSelected] = useState(linkedIcon)
  const search = useRef(null)
  const opener = useRef(null)
  const results = searchIcons(query, category, style)
  const currentSpecimen = withStyle(specimen, style) ?? withStyle(byName.get('home'), style)
  const pageCount = Math.ceil(results.length / pageSize)
  const start = (page - 1) * pageSize
  const visibleIcons = results.slice(start, start + pageSize)

  function changeQuery(value) {
    setQuery(value)
    setPage(1)
  }

  function changeCategory(value) {
    setCategory(value)
    setPage(1)
  }

  useEffect(() => {
    if (!selected && opener.current) {
      const trigger = opener.current
      opener.current = null
      const target = trigger.isConnected ? trigger : search.current
      target?.focus({ preventScroll: target === trigger })
    }
  }, [selected])

  useEffect(() => {
    function shortcut(event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey || document.querySelector('dialog[open]')) return
      if (event.target instanceof HTMLElement && (event.target.isContentEditable || /^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName))) return
      event.preventDefault()
      search.current.focus()
    }
    const back = () => {
      setStyle(linkedStyle())
      setPage(1)
      setSelected(linkedIcon())
    }
    window.addEventListener('keydown', shortcut)
    window.addEventListener('popstate', back)
    return () => {
      window.removeEventListener('keydown', shortcut)
      window.removeEventListener('popstate', back)
    }
  }, [])

  function changeStyle(value) {
    if (value === style) return
    const url = new URL(window.location.href)
    if (value === 'outline') url.searchParams.delete('gaya')
    else url.searchParams.set('gaya', value)
    window.history.replaceState(null, '', url)
    setStyle(value)
    setPage(1)
  }

  function selectIcon(icon, trigger) {
    if (icon && trigger) opener.current = trigger
    const url = new URL(window.location.href)
    if (icon) url.searchParams.set('ikon', icon.slug)
    else url.searchParams.delete('ikon')
    window.history.replaceState(null, '', url)
    setSelected(icon)
  }

  function reset() {
    changeQuery('')
    changeCategory('')
    search.current.focus()
  }

  return <div className="catalog-page">
    <Header page="catalog" />
    <main id="main" className="shell catalog">
      <section className="catalog-intro" aria-labelledby="hero-title">
        <div className="catalog-intro-copy">
          <p className="catalog-inventory">{icons.length} {t('ikon', 'icons')} <span aria-hidden="true">/</span> {iconStyles.length} {t('gaya', 'styles')}</p>
          <h1 id="hero-title">{t('Ikon untuk', 'Icons for')}<br /> {t('antarmuka.', 'interfaces.')}</h1>
          <p className="catalog-deck">{t('Cari, uji ukuran, lalu unduh SVG atau salin JSX.', 'Find an icon, test its size, then download SVG or copy JSX.')}</p>
        </div>
        <CatalogSpecimen icon={currentSpecimen} onSelect={selectIcon} />
      </section>
      <div className="catalog-tools">
        <div className="search-wrap">
          <Glyph path={uiPaths.search} size={22} />
          <input ref={search} aria-label={t('Cari ikon', 'Search icons')} type="search" value={query} onChange={(event) => changeQuery(event.target.value)} placeholder={t('Cari ikon, misalnya kamera', 'Search icons, e.g. camera')} />
          {query ? <button type="button" className="icon-button clear-search" aria-label={t('Hapus input pencarian', 'Clear search input')} onClick={() => { changeQuery(''); search.current.focus() }}><Glyph path={uiPaths.close} size={17} /></button> : <kbd aria-hidden="true">/</kbd>}
        </div>
        <StylePicker value={style} onChange={changeStyle} />
      </div>
      <div className="catalog-workbench">
        <CategoryFilter value={category} onChange={changeCategory} />
        <section className="results" aria-labelledby="results-title">
          <div className="results-heading">
            <h2 id="results-title">{query.trim() ? category ? `${t('Hasil di', 'Results in')} ${categoryLabel(category)}` : t('Hasil pencarian', 'Search results') : category ? categoryLabel(category) : t('Katalog ikon', 'Icon catalog')}</h2>
            <p role="status">{results.length ? `${start + 1}–${start + visibleIcons.length} ${t('dari', 'of')} ` : ''}{results.length} {t('ikon', results.length === 1 ? 'icon' : 'icons')}</p>
          </div>
          {visibleIcons.length ? <ul className="icon-grid">{visibleIcons.map((icon) => <li key={icon.slug}><button type="button" className="icon-tile" title={icon.slug} aria-label={`${t('Inspeksi ikon', 'Inspect icon')} ${icon.slug}`} onClick={(event) => selectIcon(icon, event.currentTarget)}><CatalogGlyph icon={icon} size={32} /><span>{icon.slug}</span></button></li>)}</ul> : <div className="empty-state"><span className="empty-mark"><Glyph path={uiPaths.search} size={30} /></span><h3>{query.trim() ? <>{t('Tidak ada ikon untuk', 'No icons for')} “{query.trim()}”</> : t('Tidak ada ikon di kategori ini', 'No icons in this category')}</h3><p>{t('Coba kata kunci lain atau kembalikan semua kategori.', 'Try another keyword or reset the category filter.')}</p><button type="button" className="button primary" onClick={reset}>{t('Hapus pencarian', 'Reset search')}</button></div>}
          {pageCount > 1 && <Pagination page={page} count={pageCount} onChange={setPage} />}
        </section>
      </div>
    </main>
    <Footer />
    {selected && <Inspector key={selected.slug} icon={selected} onClose={() => selectIcon(null)} />}
  </div>
}

function Guide() {
  const example = byName.get('search')
  return <><Header page="guide" /><main id="main" className="shell guide">
    <header className="guide-intro">
      <div className="guide-copy">
        <h1>{t(<>Panduan<br /> penggunaan.</>, 'Usage guide.')}</h1>
        <p>{t('Dari katalog ke desain atau kode: pilih gaya, cek ukuran, lalu ambil ikon dalam format yang kamu perlukan.', 'From catalog to design or code: pick a style, check the size, then export the icon in the format you need.')}</p>
        <a className="button primary" href={pageUrl('/')}>{t('Buka katalog', 'Open catalog')} <Glyph path={uiPaths.next} size={16} /></a>
      </div>
      <figure className="guide-specimen" aria-labelledby="guide-specimen-title">
        <figcaption><span>{t('Contoh ikon', 'Example icon')}</span><strong id="guide-specimen-title">search</strong></figcaption>
        <SpecimenDrawing icon={example} />
        <SizeStrip icon={example} />
        <a href={pageUrl('/?ikon=search')}>{t('Coba di inspektor', 'Try in inspector')} <Glyph path={uiPaths.next} size={15} /></a>
      </figure>
    </header>
    <ol className="guide-workflow" aria-label={t('Langkah memakai ikon', 'How to use the icons')}>
      <li><span className="guide-step-number" aria-hidden="true">01</span><section><h2>{t('Pilih bentuk dan ukuran', 'Choose a style and size')}</h2><p>{t('Pilih salah satu dari tujuh gaya di katalog, lalu buka ikon. Bandingkan ukuran 16, 24, dan 32 px. Gunakan pengatur ukuran dan warna untuk menyesuaikan hasil ekspor.', 'Choose one of seven styles in the catalog, then open an icon. Compare the 16, 24, and 32 px previews. Use the size and color controls to customize the export.')}</p></section></li>
      <li><span className="guide-step-number" aria-hidden="true">02</span><section><h2>{t('Ambil SVG atau kode', 'Get SVG or code')}</h2><dl className="guide-formats"><div><dt>SVG</dt><dd>{t(<>Pilih <strong>Unduh SVG</strong> untuk menyimpan file vektor yang bisa dipakai di desain atau web.</>, <>Choose <strong>Download SVG</strong> to save a vector file for design or the web.</>)}</dd></div><div><dt>React</dt><dd>{t(<>Pilih <strong>React</strong>, lalu <strong>Salin kode</strong> untuk menempel JSX langsung. Tidak perlu memasang paket.</>, <>Select <strong>React</strong>, then <strong>Copy code</strong> to paste JSX directly. No package required.</>)}</dd></div></dl></section></li>
      <li><span className="guide-step-number" aria-hidden="true">03</span><section><h2>{t('Beri nama pada kontrol', 'Name the control')}</h2><p>{t('Ikon ekspor bersifat dekoratif. Jika ikon menjadi satu-satunya isi tombol, beri nama pada tombolnya agar bisa dibaca pembaca layar.', 'Exported icons are decorative. If an icon is the only content in a button, give the button a name for screen readers.')}</p><pre><code>{`<button type="button" aria-label="${t('Cari', 'Search')}">\n  …\n</button>`}</code></pre></section></li>
    </ol>
    <aside className="guide-next" aria-labelledby="guide-next-title"><div><h2 id="guide-next-title">{t('Perlu satu koleksi?', 'Need the full collection?')}</h2><p>{t('Pasang paket untuk platformmu atau ambil beberapa SVG lewat CLI.', 'Install the package for your platform or fetch individual SVGs with the CLI.')}</p></div><a className="button secondary" href={pageUrl('/instalasi/')}>{t('Lihat instalasi', 'View installation')} <Glyph path={uiPaths.next} size={16} /></a></aside>
  </main><Footer /></>
}

function NotFound() {
  return <><Header /><main id="main" className="shell not-found"><div><p className="icon-meta">{t('404 / Halaman tidak ditemukan', '404 / Page not found')}</p><h1>{t('Salah arah.', 'Wrong turn.')}</h1><p>{t('Halaman ini tidak ada. Ikonnya masih bisa kamu temukan di katalog.', 'This page is missing. You can still find the icons in the catalog.')}</p><a href={pageUrl('/')} className="button primary">{t('Kembali ke katalog', 'Back to catalog')} <Glyph path={uiPaths.back} size={18} /></a></div><div className="reference-plate"><SpecimenDrawing path={uiPaths.back} /></div></main><Footer /></>
}

function App() {
  const page = window.location.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '')
  localizePageMetadata(({ '': 'catalog', '/panduan': 'guide', '/instalasi': 'install' })[page] ?? 'missing')
  if (page === '') return <Catalog />
  if (page === '/panduan') return <Guide />
  if (page === '/instalasi') return <><Header page="install" /><Install /><Footer /></>
  return <NotFound />
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
