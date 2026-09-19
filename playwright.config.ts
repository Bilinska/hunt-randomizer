import { defineConfig, devices } from "@playwright/test";

// Dedicated port and data dir so the suite never touches a running dev server
// (which may hold a live Twitch connection) or the streamer's real .data/.
const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Overlay/Twitch tests share one live server process (in-memory cooldown,
  // WS hub, settings.json) — running them in parallel workers races on that
  // shared state, so this suite is intentionally serial.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } }
  ],

  // Playwright сам піднімає dev-сервер перед тестами і гасить після
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    env: { PORT, BAYOU_DATA_DIR: ".data-e2e" },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
