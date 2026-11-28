import { spawn, spawnSync, type ChildProcess } from "node:child_process"
import { createServer } from "node:net"
import type { TestProject } from "vitest/node"
import { localStack } from "./local"

declare module "vitest" {
  export interface ProvidedContext {
    appUrl: string
  }
}

const appDir = new URL("..", import.meta.url).pathname
// Its own build folder, so the default one and a running `next dev` are left alone.
const distDir = ".next-integration"

// A port nothing is listening on.
function freePort() {
  return new Promise<number>((resolve, reject) => {
    const server = createServer()
    server.once("error", reject)
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number }
      server.close(() => resolve(port))
    })
  })
}

async function waitFor(url: string, server: ChildProcess, timeoutMs: number) {
  const until = Date.now() + timeoutMs
  while (Date.now() < until) {
    if (server.exitCode !== null) throw new Error(`The app exited with code ${server.exitCode}.`)
    try {
      const response = await fetch(url, { redirect: "manual" })
      if (response.status < 500) return
    } catch {
      // Not listening yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`The app didn't answer at ${url} within ${timeoutMs / 1000}s.`)
}

// Builds the app against the local Supabase and serves it on a free port, for the browser tests.
// The sign-in link goes to the app's /auth/callback on this address, so the local Supabase must
// allow it as a redirect: supabase/config.toml lists http://127.0.0.1:*/auth/callback.
export default async function setup(project: TestProject) {
  const stack = localStack()
  const port = await freePort()
  const appUrl = `http://127.0.0.1:${port}`
  const env = {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: stack.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: stack.anonKey,
    NEXT_DIST_DIR: distDir,
    NEXT_TELEMETRY_DISABLED: "1",
  }

  const build = spawnSync("pnpm", ["exec", "next", "build"], { cwd: appDir, env, encoding: "utf8" })
  if (build.status !== 0) {
    throw new Error(`The app didn't build:\n${(build.stdout + build.stderr).slice(-3000)}`)
  }

  const server = spawn("pnpm", ["exec", "next", "start", "-H", "127.0.0.1", "-p", String(port)], {
    cwd: appDir,
    env,
    stdio: ["ignore", "ignore", "inherit"],
    detached: true,
  })
  await waitFor(`${appUrl}/login`, server, 60_000)
  project.provide("appUrl", appUrl)

  return () => {
    // The whole group: pnpm, and the next server it started.
    if (server.pid) process.kill(-server.pid, "SIGTERM")
  }
}
