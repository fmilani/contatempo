import { execFileSync } from "node:child_process"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// The local Supabase stack, from `supabase start`, with its keys and its test inbox.
type Stack = { url: string; anonKey: string; serviceKey: string; mailpit: string }

let stack: Stack | undefined

// Reads the running stack from `supabase status`. Fails with what to run when it's down, rather
// than skipping: a suite that quietly passes when it couldn't run proves nothing.
export function localStack(): Stack {
  if (stack) return stack
  let status: Record<string, string>
  try {
    const out = execFileSync("pnpm", ["exec", "supabase", "status", "-o", "json"], {
      cwd: new URL("../../..", import.meta.url).pathname,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
    status = JSON.parse(out)
  } catch {
    throw new Error("The local Supabase isn't running. Start it with `pnpm exec supabase start`.")
  }
  stack = {
    url: status.API_URL,
    anonKey: status.PUBLISHABLE_KEY ?? status.ANON_KEY,
    serviceKey: status.SECRET_KEY ?? status.SERVICE_ROLE_KEY,
    mailpit: status.MAILPIT_URL ?? status.INBUCKET_URL,
  }
  if (!stack.url.includes("127.0.0.1") && !stack.url.includes("localhost")) {
    throw new Error(`Refusing to run against ${stack.url}: these tests create and delete users.`)
  }
  return stack
}

const noSession = { auth: { persistSession: false, autoRefreshToken: false } }

// A client with the service key: it skips row level security, for setting up and cleaning up.
export function admin(): SupabaseClient<Database> {
  const { url, serviceKey } = localStack()
  return createClient<Database>(url, serviceKey, noSession)
}

// A unique address, so runs don't collide with each other or with earlier ones.
export const testEmail = (tag: string) =>
  `it-${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`

// A new confirmed user, signed in: its client goes through row level security as that user.
export async function signedInUser(tag: string) {
  const { url, anonKey } = localStack()
  const email = testEmail(tag)
  const password = `pw-${crypto.randomUUID()}`
  const created = await admin().auth.admin.createUser({ email, password, email_confirm: true })
  if (created.error) throw created.error
  const client = createClient<Database>(url, anonKey, noSession)
  const signedIn = await client.auth.signInWithPassword({ email, password })
  if (signedIn.error) throw signedIn.error
  return { id: created.data.user.id, email, client }
}

// Deletes users made by a test. Their labels and entries go with them, by the foreign keys.
export async function deleteUsers(ids: string[]) {
  await Promise.all(ids.map((id) => admin().auth.admin.deleteUser(id)))
}
