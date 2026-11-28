import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Tests against the real local Supabase, and the app in a browser: run with `pnpm test:integration`
// after `pnpm exec supabase start`. They create their own users and delete them when done.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["integration/**/*.test.ts"],
    globalSetup: ["./integration/global-setup.ts"],
    // One file at a time: the sign-in test runs the app, and both share one database.
    fileParallelism: false,
    // A sign-in waits on email, which the local Supabase can be slow to send.
    testTimeout: 90_000,
    hookTimeout: 180_000,
  },
})
