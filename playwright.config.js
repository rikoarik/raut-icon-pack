import { defineConfig } from '@playwright/test'

const baseURL = 'http://127.0.0.1:4182'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL,
    browserName: 'chromium',
    channel: process.env.RAUT_BROWSER_CHANNEL || undefined,
    reducedMotion: 'reduce',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4182 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
})
