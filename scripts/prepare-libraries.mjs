import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { iconStyles, searchIcons, svgMarkup } from '../src/icons.js'

const root = fileURLToPath(new URL('..', import.meta.url))
const master = resolve(root, process.argv[2] ?? '../rounded-icons')
const source = readFileSync(join(root, 'src/figcraft-icons.json'))
if (!source.equals(readFileSync(join(master, 'catalog/icons.json')))) throw new Error('Master tidak sama dengan snapshot katalog RAUT.')
const { version, icons } = JSON.parse(source)
const downloads = join(root, 'public/library')
mkdirSync(downloads, { recursive: true })
const build = join(root, '.library-build')
mkdirSync(build, { recursive: true })
const stage = mkdtempSync(join(build, 'release-'))
const name = (target, extension) => `rounded-icons-${target}-${version}.${extension}`
const fromMaster = (file) => join(master, 'artifacts', file)
const run = (tool, args, cwd) => execFileSync(tool, args, { cwd, stdio: 'inherit' })
const write = (file, text) => {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
}

const svgStage = join(stage, 'svg')
mkdirSync(svgStage)
run('tar', ['-xzf', fromMaster(name('svg', 'tgz')), '-C', svgStage])
const svgDir = join(svgStage, 'package/icons')
for (const icon of icons) {
  const svg = readFileSync(join(svgDir, `${icon.name}.svg`), 'utf8')
  if (!svg.includes(`d="${icon.path}"`) || !svg.includes(`transform="translate(${icon.x} ${icon.y})"`)) throw new Error(`Geometri SVG tidak cocok: ${icon.name}`)
}

const cli = join(stage, 'cli')
cpSync(join(root, 'packages/cli'), cli, { recursive: true })
cpSync(svgDir, join(cli, 'icons'), { recursive: true })
const variants = join(stage, 'raut-icon-styles')
cpSync(svgDir, join(variants, 'outline'), { recursive: true })
for (const { id } of iconStyles) {
  if (id === 'outline') continue
  for (const icon of searchIcons('', '', id)) {
    const svg = svgMarkup(icon, 24, 'currentColor')
    write(join(cli, 'icons', id, `${icon.slug}.svg`), svg)
    write(join(variants, id, `${icon.slug}.svg`), svg)
  }
}
const stylesArchive = `raut-icon-styles-${version}.zip`
run('zip', ['-q', '-r', stylesArchive, 'raut-icon-styles'], stage)
run('npm', ['pack', '--quiet', '--pack-destination', stage], cli)

const apple = join(stage, 'RautIcons')
cpSync(join(root, 'packages/apple'), apple, { recursive: true })
const assets = join(apple, 'Sources/RautIcons/Icons.xcassets')
const info = { author: 'xcode', version: 1 }
write(join(assets, 'Contents.json'), JSON.stringify({ info }))
for (const { name, path, x, y } of icons) {
  const imageset = join(assets, `rautglyph${name.replaceAll('-', '')}v.imageset`)
  write(join(imageset, 'icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="${path}" transform="translate(${x} ${y})" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>\n`)
  write(join(imageset, 'Contents.json'), JSON.stringify({ images: [{ filename: 'icon.svg', idiom: 'universal' }], info, properties: { 'preserves-vector-representation': true, 'template-rendering-intent': 'template' } }))
}
write(join(apple, 'Sources/RautIcons/RautIconName.swift'), `// Generated from the FigCraft icon catalog.\npublic enum RautIconName: String, CaseIterable, Sendable {\n${icons.map(({ name }) => `    case \`${name.replace(/-([a-z])/g, (_, next) => next.toUpperCase()).replaceAll('-', '_')}\` = "${name}"`).join('\n')}\n}\n`)
// Serve gzip tarballs as .tgz so static servers send them as downloads, not HTTP compression.
const appleArchive = `raut-icons-apple-${version}.tgz`
run('tar', ['-czf', join(stage, appleArchive), 'RautIcons'], stage)

const android = name('android', 'aar')
const coordinates = join('dev', 'roundedicons', 'rounded-icons-android', version)
const maven = join(stage, 'raut-maven', coordinates)
mkdirSync(maven, { recursive: true })
cpSync(fromMaster(android), join(maven, android))
write(join(maven, name('android', 'pom')), `<?xml version="1.0" encoding="UTF-8"?>\n<project xmlns="http://maven.apache.org/POM/4.0.0">\n  <modelVersion>4.0.0</modelVersion>\n  <groupId>dev.roundedicons</groupId>\n  <artifactId>rounded-icons-android</artifactId>\n  <version>${version}</version>\n  <packaging>aar</packaging>\n</project>\n`)
const mavenArchive = `raut-maven-${version}.zip`
run('zip', ['-q', '-r', mavenArchive, 'raut-maven'], stage)

const originals = [name('svg', 'tgz'), name('react', 'tgz'), name('react-native', 'tgz'), name('flutter', 'tar.gz'), android]
const generated = [`raut-icons-cli-${version}.tgz`, appleArchive, mavenArchive, stylesArchive]
for (const file of originals) if (!existsSync(fromMaster(file))) throw new Error(`Paket sumber belum tersedia: ${file}`)
for (const file of originals) cpSync(fromMaster(file), join(downloads, file.replace(/\.tar\.gz$/, '.tgz')))
for (const file of generated) cpSync(join(stage, file), join(downloads, file))
console.log(`${originals.length + generated.length} paket siap: ${downloads}`)
console.log(`Sumber paket hasil generate: ${stage}`)
