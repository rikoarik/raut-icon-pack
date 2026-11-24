import { useLayoutEffect, useRef, useState } from 'react'
import { uiPaths } from './icons.js'
import { t } from './i18n.js'
import { assetUrl, cliCommand, gitUrl, mavenUrl, releaseTag, releaseUrl, version } from './releases.js'
import './install.css'

const targets = [
  { id: 'web', label: t('Web & desktop web', 'Web & desktop web'), platforms: t('React, Next.js, dan SVG', 'React, Next.js, and SVG') },
  { id: 'mobile', label: t('Mobile & desktop native', 'Mobile & native desktop'), platforms: t('Expo, Android, Flutter, dan SwiftUI', 'Expo, Android, Flutter, and SwiftUI') },
  { id: 'cli', label: 'CLI / npx', platforms: t('Ambil SVG dalam tujuh gaya', 'Get SVGs in seven styles') },
]

function InstallGlyph({ path, size = 16 }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true" focusable="false"><path d={path} fillRule="evenodd" /></svg>
}

function Download({ file, children }) {
  return <a className="install-download" href={assetUrl(file)}><InstallGlyph path={uiPaths.download} />{children}</a>
}

function Snippet({ label, children }) {
  const [feedback, setFeedback] = useState('')
  const code = useRef(null)
  async function copy() {
    try {
      await navigator.clipboard.writeText(children)
      setFeedback('copied')
    } catch {
      code.current.focus()
      window.getSelection()?.selectAllChildren(code.current)
      setFeedback('manual')
    }
  }
  const copied = t('Tersalin', 'Copied')
  return <figure className="install-snippet">
    <figcaption className="install-snippet-bar"><span>{label}</span><button type="button" onClick={copy} aria-label={`${t('Salin', 'Copy')} ${label}`}><InstallGlyph path={uiPaths.copy} />{feedback === 'copied' ? copied : t('Salin', 'Copy')}</button></figcaption>
    <pre ref={code} tabIndex={0} aria-label={label}><code>{children}</code></pre>
    <p role="status" className={`install-feedback${feedback === 'copied' ? ' install-feedback-hidden' : ''}`}>{feedback === 'copied' ? copied : feedback === 'manual' ? t('Kode dipilih. Salin dengan pintasan perangkatmu.', 'Code selected. Copy it with your device shortcut.') : ''}</p>
  </figure>
}

function InstallSection({ index, children }) {
  const { id, label } = targets[index]
  return <section id={id} aria-labelledby={`install-${id}`} tabIndex={-1}>
    <header className="install-section-title"><span aria-hidden="true">0{index + 1}</span><h2 id={`install-${id}`}>{label}</h2></header>
    <div className="install-section-body">{children}</div>
  </section>
}

export function Install() {
  useLayoutEffect(() => {
    const id = window.location.hash.slice(1)
    if (targets.some(target => target.id === id)) document.getElementById(id)?.scrollIntoView()
  }, [])

  return <main id="main" className="shell install-page">
    <header className="install-intro" id="target-instalasi">
      <div className="install-copy">
        <p className="install-version">{releaseTag} / GitHub</p>
        <h1>{t('Pasang library.', 'Install RAUT.')}</h1>
        <p>{t('Pilih platform untuk memasang paket dari GitHub. Untuk satu atau dua ikon, ambil SVG langsung dengan npx.', 'Pick your platform to install from GitHub. For just a few icons, fetch SVGs directly with npx.')}</p>
        <a className="install-release" href={releaseUrl}>{t('Lihat rilis GitHub', 'View GitHub release')} <InstallGlyph path={uiPaths.arrow} /></a>
      </div>
      <nav className="install-nav" aria-labelledby="install-nav-title">
        <h2 id="install-nav-title">{t('Pilih target instalasi', 'Choose your platform')}</h2>
        {targets.map(({ id, label, platforms }) => <a key={id} href={`#${id}`} aria-labelledby={`target-${id}`}><span><strong id={`target-${id}`}>{label}</strong><small>{platforms}</small></span><InstallGlyph path={uiPaths.chevron} /></a>)}
      </nav>
    </header>
    <div className="install-content">
      <InstallSection index={0}>
        <h3>React &amp; Next.js</h3>
        <p>{t('Untuk React 18+, pasang paket dari GitHub dan impor ikon yang diperlukan. Juga bisa dipakai di renderer React Electron atau Tauri.', 'For React 18+, install the package from GitHub and import the icons you need. Also works in React renderers for Electron or Tauri.')}</p>
        <Snippet label="Terminal · React">{`npm install ${assetUrl('react')}`}</Snippet>
        <Snippet label={t('Contoh React', 'React example')}>{'import { Home } from \'@rounded-icons/react/icons/home\';\n\n<Home size={24} />'}</Snippet>
        <Download file="react">{t('Unduh paket React (.tgz)', 'Download React package (.tgz)')}</Download>
        <h3>Vue, Nuxt, Svelte, Angular, HTML</h3>
        <p>{t(<>Pakai paket SVG tanpa ketergantungan framework, atau gunakan <a href="#cli">CLI</a> untuk menyalin ikon langsung ke folder aset.</>, <>Use the framework-independent SVG package, or use the <a href="#cli">CLI</a> to copy icons straight into your assets folder.</>)}</p>
        <Snippet label="Terminal · SVG">{`npm install ${assetUrl('svg')}`}</Snippet>
        <Download file="svg">{t('Unduh paket SVG dan sprite (.tgz)', 'Download SVG and sprite package (.tgz)')}</Download>
      </InstallSection>
      <InstallSection index={1}>
        <h3>React Native &amp; Expo</h3>
        <p>{t(<>Pasang paket ikon dan <code>react-native-svg</code>. Tanpa Expo, pasang versi mayor 15 yang kompatibel dengan versi React Native proyekmu.</>, <>Install the icon package and <code>react-native-svg</code>. Without Expo, install a compatible release from major version 15 for your React Native project.</>)}</p>
        <Snippet label="Terminal · Expo">{`npm install ${assetUrl('native')}\nnpx expo install react-native-svg`}</Snippet>
        <Snippet label={t('Contoh React Native', 'React Native example')}>{'import { Home } from \'@rounded-icons/react-native/icons/home\';\n\n<Home size={24} color="#131C2D" />'}</Snippet>
        <Download file="native">{t('Unduh paket React Native (.tgz)', 'Download React Native package (.tgz)')}</Download>
        <h3>Android &amp; Jetpack Compose</h3>
        <p>{t(<>Tambahkan repo Maven bertag berikut di <code>dependencyResolutionManagement.repositories</code> pada <code>settings.gradle.kts</code>. Perlu <code>minSdk 24</code> dan <code>compileSdk 36</code> atau lebih tinggi.</>, <>Add this tagged Maven repository under <code>dependencyResolutionManagement.repositories</code> in <code>settings.gradle.kts</code>. Requires <code>minSdk 24</code> and <code>compileSdk 36</code> or later.</>)}</p>
        <Snippet label="settings.gradle.kts">{`maven {\n    url = uri("${mavenUrl}")\n    content { includeGroup("dev.roundedicons") }\n}`}</Snippet>
        <Snippet label="app/build.gradle.kts">{`dependencies {\n    implementation("dev.roundedicons:rounded-icons-android:${version}")\n}`}</Snippet>
        <Snippet label={t('Contoh Jetpack Compose', 'Jetpack Compose example')}>{`import androidx.compose.material3.Icon\nimport androidx.compose.ui.res.painterResource\nimport dev.roundedicons.android.R as RoundedR\n\nIcon(painterResource(RoundedR.drawable.ri_home), contentDescription = "${t('Beranda', 'Home')}")`}</Snippet>
        <p>{t('Butuh instalasi offline? Pakai ZIP Maven atau AAR langsung. Paket ini untuk Android, bukan Compose Desktop.', 'Need an offline install? Use the Maven ZIP or direct AAR. This package targets Android, not Compose Desktop.')}</p>
        <div className="install-downloads"><Download file="maven">{t('Unduh repo Maven (.zip)', 'Download Maven repository (.zip)')}</Download><Download file="android">{t('Unduh AAR Android', 'Download Android AAR')}</Download></div>
        <h3>Flutter</h3>
        <p>{t(<>Tambahkan dependency Git berikut ke <code>pubspec.yaml</code>, lalu jalankan <code>flutter pub get</code>. Paket ini bisa dipakai di mobile, web, dan desktop.</>, <>Add this Git dependency to <code>pubspec.yaml</code>, then run <code>flutter pub get</code>. This package works on mobile, web, and desktop.</>)}</p>
        <Snippet label="pubspec.yaml">{`dependencies:\n  rounded_icons:\n    git:\n      url: ${gitUrl}\n      ref: ${releaseTag}\n      path: packages/flutter`}</Snippet>
        <Snippet label={t('Contoh Flutter', 'Flutter example')}>{"import 'package:rounded_icons/rounded_icons.dart';\n\nconst RoundedIcon(RoundedIcons.home, size: 24);"}</Snippet>
        <Download file="flutter">{t('Unduh paket Flutter (.tgz)', 'Download Flutter package (.tgz)')}</Download>
        <h3>SwiftUI / iOS &amp; macOS</h3>
        <p>{t(<>Di Xcode, buka <strong>File → Add Package Dependencies</strong>, masukkan URL Git berikut, pilih versi <code>{version}</code>, dan tambahkan produk <code>RautIcons</code> ke target aplikasi. Mendukung iOS 15+ dan macOS 12+.</>, <>In Xcode, open <strong>File → Add Package Dependencies</strong>, enter this Git URL, select version <code>{version}</code>, and add the <code>RautIcons</code> product to your app target. Supports iOS 15+ and macOS 12+.</>)}</p>
        <Snippet label={t('URL paket Swift', 'Swift package URL')}>{gitUrl}</Snippet>
        <Snippet label={t('Contoh SwiftUI', 'SwiftUI example')}>{`import RautIcons\nimport SwiftUI\n\nRautIcon(.home, size: 24, label: "${t('Beranda', 'Home')}")`}</Snippet>
        <Download file="apple">{t('Unduh Swift Package (.tgz)', 'Download Swift Package (.tgz)')}</Download>
      </InstallSection>
      <InstallSection index={2}>
        <p>{t(<>Jalankan CLI langsung dari GitHub Release, tanpa memasang dependency runtime. <code>list</code> mencari nama ikon; <code>add</code> menyalin SVG tanpa menimpa file.</>, <>Run the CLI directly from GitHub Releases, with no runtime dependency. <code>list</code> finds icons by name; <code>add</code> copies SVGs without overwriting files.</>)}</p>
        <Snippet label="Terminal · CLI">{`${cliCommand} list arrow\n${cliCommand} add home --out ./public/icons`}</Snippet>
        <Snippet label={t('Terminal · Potong Serong', 'Terminal · Beveled')}>{`${cliCommand} add home --style potong-serong --out ./public/icons`}</Snippet>
        <p>{t(<>Contoh menghasilkan <code>home.svg</code> dan <code>home-potong-serong.svg</code> di <code>public/icons/</code>. Paket komponen berisi Outline; CLI dan ZIP berisi seluruh 612 ikon × 7 gaya.</>, <>These examples write <code>home.svg</code> and <code>home-potong-serong.svg</code> to <code>public/icons/</code>. Component packages contain Outline; the CLI and ZIP include all 612 icons × 7 styles.</>)}</p>
        <div className="install-downloads"><Download file="cli">{t('Unduh CLI (.tgz)', 'Download CLI (.tgz)')}</Download><Download file="styles">{t('Unduh koleksi SVG (.zip)', 'Download SVG collection (.zip)')}</Download></div>
      </InstallSection>
    </div>
    <a className="install-back" href="#target-instalasi">{t('Kembali ke pilihan platform', 'Back to platform choices')} <InstallGlyph path={uiPaths.back} /></a>
  </main>
}
