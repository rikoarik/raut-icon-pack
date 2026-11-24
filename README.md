# RAUT

Pustaka ikon vektor dengan antarmuka Indonesia dan English. RAUT dibangun terpisah dari Rounded Icons dengan React, Vite, dan CSS, tanpa backend atau panggilan API. Pilih **ID / EN** di navigasi, atau bagikan tautan dengan `?lang=en`.

[Install from GitHub (English)](#install-from-github) · [Instalasi (Indonesia)](#instalasi-dari-github) · [GitHub Releases](https://github.com/rikoarik/raut-icon-pack/releases)

## Jalankan lokal

```sh
npm ci
npm run dev
```

Gunakan URL yang tercetak di terminal. Untuk build statis:

```sh
npm run lint
npm run build
npm run preview -- --host 127.0.0.1 --port 4181
```

## Uji browser

```sh
npx playwright install chromium
npm run build
npm test
```

Kalau Chrome sudah terpasang, jalankan `RAUT_BROWSER_CHANNEL=chrome npm test` sebagai alternatif instalasi Chromium Playwright.

## Isi proyek

- `/`: katalog dengan 18 ikon per halaman dan 612 ikon dalam 51 kategori untuk masing-masing gaya: **Outline**, **Bold**, **Broken**, **Potong Serong**, **Tipis**, **Bayang**, dan **Piksel**. Pencarian dan filter berlaku pada gaya aktif. `/` pada keyboard memfokuskan pencarian; `/?gaya=bayang&ikon=camera` membuka inspektor untuk varian tersebut.
- `/studi-ikon/`: tautan lama dialihkan ke `/?gaya=potong-serong`; tidak ada lagi halaman studi.
- `/panduan/`: cara mengunduh, menyalin, dan memberi label aksesibel pada ikon.
- `/instalasi/`: unduhan dan perintah instalasi yang bisa disalin untuk web, mobile, dan desktop.
- `/404.html`: halaman kesalahan yang masuk ke hasil build; tetapkan sebagai halaman HTTP 404 di hosting statis. Build ini mengasumsikan hosting di root domain.
- `src/figcraft-icons.json`: salinan byte-identik katalog master `rounded-icons/catalog/icons.json` v0.1.0. Outline mempertahankan grid 24 × 24, path, offset, dan stroke bulat 2 px.
- `src/modern-geometry.js`: enam varian dari revisi FigCraft, termasuk lapisan isi, nada sekunder, dan kisi 16 × 16. Koreksi gambar tangan ada di file tersebut, `src/specimen-paths.js`, `src/broken-paths.js`, dan `src/icon-study.js`.
- `DESIGN.md`: arah visual lembar spesimen, tipografi, tata letak, dan perilaku gerak.

## React Bits melalui MCP

Buka OpenCode dari root RAUT dan jalankan `opencode mcp list`. Konfigurasi proyek (`opencode.jsonc`) menjalankan server shadcn secara lokal. `components.json` mendaftarkan `@react-bits` ke `https://reactbits.dev/r/{name}.json`. Gunakan MCP untuk melihat katalog registry, mencari, dan meninjau komponen; tool `get_add_command_for_items` memberikan perintah pemasangan. Panduan: [React Bits MCP](https://reactbits.dev/get-started/mcp) dan [shadcn MCP](https://ui.shadcn.com/docs/mcp).

RAUT memakai `@react-bits/GlareHover-JS-CSS` untuk spesimen. Komponen disalin ke `src/components/`, bukan dimuat dari CDN, dan diadaptasi untuk reduced motion serta layar sentuh. Lisensi: [React Bits — MIT + Commons Clause](public/licenses/react-bits.txt). Komponen tersebut tidak disertakan dalam paket ikon RAUT. Jangan gunakan `add --overwrite` saat memperbarui tanpa meninjau adaptasi lokal.

## Instalasi dari GitHub

Tidak perlu mengunduh paket secara manual. Paket web dan CLI diambil dari [GitHub Release v0.1.0](https://github.com/rikoarik/raut-icon-pack/releases/tag/v0.1.0). Android memakai repositori Maven di tag yang sama; Flutter dan Swift memakai Git. Tidak dipublikasikan ke npm, Maven Central, atau pub.dev.

Paket komponen berisi Outline. CLI dan ZIP koleksi mencakup 4.284 varian (612 ikon × 7 gaya). Arsip offline tetap tersedia di rilis. Perintah dan konfigurasi per platform ada di bawah.

## Install from GitHub

Install directly from GitHub: release assets for npm and `npx`, a tagged Maven directory for Android, and Git dependencies for Flutter and Swift. Component packages include Outline; the CLI and SVG collection ZIP include all 4,284 variants.

### CLI / npx

```sh
npx --yes --package=https://github.com/rikoarik/raut-icon-pack/releases/download/v0.1.0/raut-icons-cli-0.1.0.tgz raut-icons add home --style potong-serong --out ./public/icons
```

### React / SVG / React Native

Run only the command for your platform. Expo also requires `npx expo install react-native-svg`.

```sh
npm install https://github.com/rikoarik/raut-icon-pack/releases/download/v0.1.0/rounded-icons-react-0.1.0.tgz
npm install https://github.com/rikoarik/raut-icon-pack/releases/download/v0.1.0/rounded-icons-svg-0.1.0.tgz
npm install https://github.com/rikoarik/raut-icon-pack/releases/download/v0.1.0/rounded-icons-react-native-0.1.0.tgz
```

### Android / Jetpack Compose

Inside `dependencyResolutionManagement.repositories` in `settings.gradle.kts`:

```kotlin
maven {
    url = uri("https://raw.githubusercontent.com/rikoarik/raut-icon-pack/v0.1.0/maven")
    content { includeGroup("dev.roundedicons") }
}
```

In your module's `dependencies` block (`app/build.gradle.kts`):

```kotlin
implementation("dev.roundedicons:rounded-icons-android:0.1.0")
```

Requires min SDK 24 and compile SDK 36 or higher. This is an Android AAR, not a Compose Desktop library.

### Flutter

In `pubspec.yaml`, then run `flutter pub get`:

```yaml
dependencies:
  rounded_icons:
    git:
      url: https://github.com/rikoarik/raut-icon-pack.git
      ref: v0.1.0
      path: packages/flutter
```

### SwiftUI

In Xcode, choose **File → Add Package Dependencies**, enter `https://github.com/rikoarik/raut-icon-pack.git`, select version `0.1.0`, and add product `RautIcons` to your target. Supports iOS 15+ and macOS 12+.

## Paket rilis / Release maintenance

- `npm run pack:libraries`: buat ulang arsip di `public/library/` dari `../rounded-icons` beserta artefaknya, tanpa mengubah proyek master. Lokasi alternatif: `npm run pack:libraries -- /path/to/rounded-icons`.
- `npm run pack:github`: siapkan struktur Maven, sumber Flutter, dan aset Swift dari arsip yang sama. Commit hasilnya sebelum membuat tag. Jika paket baru menghapus file, tinjau juga file hasil generate yang sudah tidak dipakai.
- Attach the nine archives from `public/library/` to the matching GitHub release. Keep the tag, `src/releases.js`, and installation examples in sync. Public hosting does not imply an open-source license; no project-wide license is granted here.

Font Space Grotesk, Source Sans 3, dan IBM Plex Mono dilayani lokal melalui Fontsource. Lisensi font tersedia pada paket masing-masing.
