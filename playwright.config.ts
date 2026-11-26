import { defineConfig, devices } from '@playwright/test'

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file)
  } catch {
    continue
  }
}

const AUTH_FILE = 'e2e/.auth/user.json'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    timezoneId: 'Asia/Bangkok',
    locale: 'th-TH',
    launchOptions: { slowMo: Number(process.env.E2E_SLOWMO ?? (process.argv.includes('--headed') ? 400 : 0)) },
  },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    {
      name: 'public',
      testMatch: /auth-redirect\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testIgnore: /auth-redirect\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
