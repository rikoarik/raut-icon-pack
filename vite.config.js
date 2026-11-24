import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: ['index.html', 'instalasi/index.html', 'panduan/index.html', 'studi-ikon/index.html', '404.html'].map((page) => resolve(import.meta.dirname, page)),
    },
  },
})
