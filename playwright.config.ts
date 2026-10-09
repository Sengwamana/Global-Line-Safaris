import { defineConfig, devices } from "@playwright/test"
import { existsSync } from "node:fs"

// Use the system Chrome when Playwright's bundled Chromium is not installed
// (some platforms cannot download it). Falls back to the bundled browser on CI.
const systemChrome = "/usr/bin/google-chrome"
const launchOptions = existsSync(systemChrome)
  ? { executablePath: systemChrome, args: ["--no-sandbox", "--disable-dev-shm-usage"] }
  : undefined

export default defineConfig({
  testDir: "./src/__tests__/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
})
