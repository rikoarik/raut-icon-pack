#!/usr/bin/env node
import { constants } from 'node:fs'
import { copyFile, mkdir, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = fileURLToPath(new URL('./icons/', import.meta.url))
const [command, ...args] = process.argv.slice(2)
const styles = ['outline', 'bold', 'broken', 'potong-serong', 'tipis', 'bayang', 'piksel']
const help = `raut-icons list [filter] [--style <gaya>]\nraut-icons add <nama-ikon>... [--style <gaya>] [--out <folder>]\n\nGaya: ${styles.join(', ')}.\nDefault folder: ./icons. File yang sudah ada tidak ditimpa.`

function takeOption(name, fallback) {
  const index = args.indexOf(name)
  if (index === -1) return fallback
  if (!args[index + 1] || args[index + 1].startsWith('-') || args.lastIndexOf(name) !== index) throw new Error(help)
  return args.splice(index, 2)[1]
}

async function run() {
  if (!command || command === '--help' || command === '-h') return console.log(help)
  const style = takeOption('--style', 'outline')
  if (!styles.includes(style)) throw new Error(`Gaya tidak tersedia: ${style}`)
  const source = style === 'outline' ? base : join(base, style)
  const names = (await readdir(source)).filter((file) => file.endsWith('.svg')).map((file) => file.slice(0, -4)).sort()
  if (command === 'list' && args.length <= 1) {
    const query = args[0]?.toLowerCase() ?? ''
    const matches = names.filter((name) => name.includes(query))
    if (matches.length) console.log(matches.join('\n'))
    return
  }
  if (command !== 'add') throw new Error(help)
  const out = resolve(takeOption('--out', 'icons'))
  const selected = [...new Set(args)]
  if (!selected.length) throw new Error(help)
  const unknown = selected.filter((name) => !names.includes(name))
  if (unknown.length) throw new Error(`Ikon tidak ditemukan: ${unknown.join(', ')}`)
  await mkdir(out, { recursive: true })
  for (const name of selected) {
    const file = `${name}${style === 'outline' ? '' : `-${style}`}.svg`
    try {
      await copyFile(join(source, `${name}.svg`), join(out, file), constants.COPYFILE_EXCL)
      console.log(`Disalin: ${join(out, file)}`)
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
      console.warn(`Dilewati (sudah ada): ${join(out, file)}`)
    }
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
