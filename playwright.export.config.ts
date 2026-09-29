import { defineConfig } from "@playwright/test";

const prefix = process.env.EXPORT_BASE_PATH || "";
export default defineConfig({
  testDir: "./tests/export",
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: `http://127.0.0.1:3100${prefix}/`,
    channel: process.env.CI ? undefined : "msedge",
    headless: true,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: process.env.CI
    ? {
        command: "node scripts/serve-export.mjs",
        url: `http://127.0.0.1:3100${prefix}/`,
        reuseExistingServer: false,
      }
    : undefined,
  reporter: "list",
});
