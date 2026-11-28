import { chromium, type Browser, type Page } from "playwright-core"
import { afterAll, beforeAll, expect, inject, test } from "vitest"
import { admin, deleteUsers, localStack, testEmail } from "./local"

// Signs in the way a person does: the login page sends a magic link, the local Supabase's test
// inbox (Mailpit) catches the email, and the browser follows the link through /auth/callback.

const appUrl = inject("appUrl")
let browser: Browser
// Every address a test signs in with, from the start, so a test that fails halfway still has its
// user deleted. The app creates the users, so they're found by address at the end.
const emails: string[] = []
const newEmail = (tag: string) => {
  const email = testEmail(tag)
  emails.push(email)
  return email
}

// Chromium from the system, or one Playwright installed.
const executablePath = process.env.CHROMIUM_PATH ?? "/usr/bin/chromium"

beforeAll(async () => {
  browser = await chromium.launch({ executablePath })
})

afterAll(async () => {
  await browser?.close()
  const ids = await Promise.all(emails.map(userIdOf))
  await deleteUsers(ids.filter((id): id is string => Boolean(id)))
})

type MailpitMessage = { ID: string; Subject: string; Created: string }

async function emailsTo(email: string) {
  const { mailpit } = localStack()
  const search = await fetch(`${mailpit}/api/v1/search?query=${encodeURIComponent(`to:"${email}"`)}`)
  return ((await search.json()) as { messages: MailpitMessage[] }).messages
}

// The first email to `email` that isn't one of `seen`, once it arrives.
async function nextEmail(email: string, seen: Set<string>) {
  const { mailpit } = localStack()
  const until = Date.now() + 15_000
  while (Date.now() < until) {
    const fresh = (await emailsTo(email)).filter((message) => !seen.has(message.ID))
    if (fresh.length > 0) {
      const message = await fetch(`${mailpit}/api/v1/message/${fresh[0].ID}`)
      return (await message.json()) as { Subject: string; Text: string; HTML: string }
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  throw new Error(`No email reached ${email}.`)
}

// The sign-in link in an email, which goes through Supabase to the app's callback.
function signInLink(email: { Text: string; HTML: string }) {
  const link = /https?:\/\/[^\s"'<>)]+\/auth\/v1\/verify\?[^\s"'<>)]+/.exec(email.HTML || email.Text)?.[0]
  if (!link) throw new Error(`No sign-in link in:\n${email.Text}`)
  return link.replaceAll("&amp;", "&")
}

// Asks for a link from the login page. The local Supabase refuses a second link to one address
// within a second of the last, which a test signing out and back in can hit: then it waits and
// asks again, as a person would. Each send is waited out first, so two are never in flight at
// once for the same address, which the local auth server can hang on.
async function requestLink(page: Page, email: string) {
  // The emails already there, so an earlier link is never taken for the new one.
  const seen = new Set((await emailsTo(email)).map((message) => message.ID))
  await page.goto(`${appUrl}/login`)
  await page.getByRole("textbox", { name: "Email" }).fill(email)
  const send = page.getByRole("button", { name: "Email me a sign-in link" })
  const sent = page.getByText(`Check ${email} for your sign-in link.`)
  for (let attempt = 0; attempt < 5; attempt++) {
    await send.click()
    // The button is disabled while the request runs.
    await expect.poll(() => send.getAttribute("aria-disabled"), { timeout: 15_000 }).not.toBe("true")
    if (await sent.isVisible()) return nextEmail(email, seen)
    const error = (await page.locator('[data-slot="field-error"]').allTextContents()).join(" ")
    if (!/only request this after/i.test(error)) {
      throw new Error(`The login page couldn't send a link: ${error || "no message"}`)
    }
    await page.waitForTimeout(1200)
  }
  throw new Error("The login page was still rate limited after five tries.")
}

async function userIdOf(email: string) {
  const { data } = await admin().auth.admin.listUsers({ perPage: 1000 })
  return data.users.find((user) => user.email === email)?.id
}

test("signed out, every page goes to the login page", async () => {
  const page = await browser.newPage()
  for (const path of ["/", "/history"]) {
    await page.goto(`${appUrl}${path}`)
    expect(new URL(page.url()).pathname, path).toBe("/login")
  }
  await page.close()
})

test("a magic link signs a new person in, and they land on the timer", async () => {
  const context = await browser.newContext()
  const page = await context.newPage()
  const email = newEmail("signin")

  const message = await requestLink(page, email)
  expect(message.Subject).toMatch(/sign-in link/i)
  const link = signInLink(message)
  // The link comes back to this app's callback, not anywhere else.
  expect(new URL(link).searchParams.get("redirect_to")).toBe(`${appUrl}/auth/callback`)

  await page.goto(link)
  await page.getByRole("button", { name: "Start timer" }).waitFor()
  expect(new URL(page.url()).pathname).toBe("/")
  const id = await userIdOf(email)
  expect(id).toBeTruthy()

  // Signed in, the login page sends you back to the app, and the session survives a reload.
  await page.goto(`${appUrl}/login`)
  expect(new URL(page.url()).pathname).toBe("/")
  await page.reload()
  await page.getByRole("button", { name: "Start timer" }).waitFor()

  // What they do is saved as them: a timer started here belongs to this user.
  await page.getByRole("button", { name: "Start timer" }).click()
  await page.getByRole("button", { name: "Stop timer" }).waitFor()
  await expect
    .poll(async () => (await admin().from("time_entries").select("user_id").eq("user_id", id!)).data?.length)
    .toBe(1)

  // Signing out ends the session: the app's pages go back to the login page.
  await page.getByRole("button", { name: "Sign out" }).click()
  await page.waitForURL((url) => url.pathname === "/login")
  await page.goto(`${appUrl}/history`)
  expect(new URL(page.url()).pathname).toBe("/login")
  await context.close()
})

test("a link works once: used again, it shows the login page with an error", async () => {
  const context = await browser.newContext()
  const page = await context.newPage()
  const email = newEmail("once")
  const link = signInLink(await requestLink(page, email))

  await page.goto(link)
  await page.getByRole("button", { name: "Start timer" }).waitFor()
  await context.close()

  // A fresh browser, as if the link were opened again elsewhere.
  const other = await browser.newContext()
  const second = await other.newPage()
  await second.goto(link)
  expect(new URL(second.url()).pathname).toBe("/login")
  await second.getByText(/invalid or has expired/i).waitFor()
  await other.close()
})

test("a made-up callback code doesn't sign anyone in", async () => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`${appUrl}/auth/callback?code=${crypto.randomUUID()}`)
  expect(new URL(page.url()).pathname).toBe("/login")
  await page.getByText(/invalid or has expired/i).waitFor()
  await page.goto(`${appUrl}/`)
  expect(new URL(page.url()).pathname).toBe("/login")
  await context.close()
})

test("signing in again as an existing person reaches the same account", async () => {
  const context = await browser.newContext()
  const page = await context.newPage()
  const email = newEmail("again")

  await page.goto(signInLink(await requestLink(page, email)))
  await page.getByRole("button", { name: "Start timer" }).waitFor()
  const first = await userIdOf(email)
  await page.getByRole("button", { name: "Sign out" }).click()
  await page.waitForURL((url) => url.pathname === "/login")

  await page.goto(signInLink(await requestLink(page, email)))
  await page.getByRole("button", { name: "Start timer" }).waitFor()
  expect(await userIdOf(email)).toBe(first)
  await context.close()
})
