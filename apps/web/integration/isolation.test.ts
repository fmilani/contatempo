import { afterAll, beforeAll, describe, expect, test } from "vitest"
import { createApi, type Api, type Entry } from "@/lib/api"
import { admin, deleteUsers, signedInUser } from "./local"

// Two real users on the local Supabase, each signed in with their own session. Everything goes
// through the database's row level security, the same as in production: these tests check that
// one user can't read, change or link to the other's labels and entries, by any route the app
// or a hand-made request could take.

type User = Awaited<ReturnType<typeof signedInUser>> & { api: Api }

// The database writes times as +00:00 and the app as Z: compare them as instants.
const asInstants = (entries: Entry[]) =>
  entries.map((entry) => ({
    ...entry,
    startedAt: Date.parse(entry.startedAt),
    endedAt: entry.endedAt && Date.parse(entry.endedAt),
  }))

let alice: User
let bob: User
const hour = 3_600_000
const at = (hoursAgo: number) => new Date(Date.now() - hoursAgo * hour).toISOString()

// Alice's things, made through the app's own API as her.
const aliceLabel = { id: crypto.randomUUID(), name: "Secret project", color: "#2563eb" }
const aliceEntry: Entry = {
  id: crypto.randomUUID(),
  description: `Planning #<label:${aliceLabel.id}>`,
  labelIds: [aliceLabel.id],
  startedAt: at(3),
  endedAt: at(2),
}

beforeAll(async () => {
  const [a, b] = await Promise.all([signedInUser("alice"), signedInUser("bob")])
  alice = { ...a, api: createApi(a.client) }
  bob = { ...b, api: createApi(b.client) }
  await alice.api.createLabel(aliceLabel)
  await alice.api.saveEntry(aliceEntry, true)
  await alice.api.startTimer(crypto.randomUUID(), new Date().toISOString())
})

afterAll(async () => {
  await deleteUsers([alice?.id, bob?.id].filter(Boolean))
})

describe("each user sees only their own data", () => {
  test("Alice sees what she made", async () => {
    expect(await alice.api.listLabels()).toEqual([aliceLabel])
    expect(asInstants(await alice.api.listEntries({ labelIds: [] }))).toEqual(asInstants([aliceEntry]))
    expect(await alice.api.getRunning()).not.toBeNull()
  })

  test("Bob sees none of it through the app", async () => {
    expect(await bob.api.listLabels()).toEqual([])
    expect(await bob.api.listEntries({ labelIds: [] })).toEqual([])
    expect(await bob.api.listEntries({ labelIds: [aliceLabel.id] })).toEqual([])
    expect(await bob.api.getRunning()).toBeNull()
  })

  test("nor by asking the tables directly, even by id", async () => {
    const tables = ["labels", "time_entries", "time_entry_labels"] as const
    for (const table of tables) {
      const { data, error } = await bob.client.from(table).select("*")
      expect(error, table).toBeNull()
      expect(data, table).toEqual([])
    }
    const byId = await bob.client.from("time_entries").select("*").eq("id", aliceEntry.id)
    expect(byId.data).toEqual([])
  })

  test("signed out, nothing can be read at all", async () => {
    const { url, anonKey } = await import("./local").then((m) => m.localStack())
    const { createClient } = await import("@supabase/supabase-js")
    const anon = createClient(url, anonKey, { auth: { persistSession: false } })
    const { data, error } = await anon.from("time_entries").select("*")
    // Revoked for anonymous visitors: an error, or at best nothing.
    expect(error !== null || data?.length === 0).toBe(true)
  })
})

describe("Bob can't change Alice's data", () => {
  // Whatever Bob tries, Alice's rows must stay exactly as they were.
  async function expectAliceUntouched() {
    expect(asInstants(await alice.api.listEntries({ labelIds: [] }))).toEqual(asInstants([aliceEntry]))
    expect(await alice.api.listLabels()).toEqual([aliceLabel])
  }

  test("updating her entry through the app finds nothing to update", async () => {
    await expect(
      bob.api.saveEntry({ ...aliceEntry, description: "Hijacked", labelIds: [] }, false)
    ).rejects.toThrow(/not found/i)
    await expect(bob.api.setEntryDetails(aliceEntry.id, "Hijacked", [])).rejects.toThrow(
      /not found/i
    )
    await expectAliceUntouched()
  })

  test("deleting her entry deletes nothing", async () => {
    await bob.api.deleteEntry(aliceEntry.id)
    const direct = await bob.client.from("labels").delete().eq("id", aliceLabel.id).select()
    expect(direct.data).toEqual([])
    await expectAliceUntouched()
  })

  test("stopping a timer only stops his own, and he has none", async () => {
    await bob.api.stopTimer(new Date().toISOString())
    expect(await alice.api.getRunning()).not.toBeNull()
  })

  test("writing rows in her name is refused", async () => {
    const label = await bob.client
      .from("labels")
      .insert({ name: "Planted", color: "#16a34a", user_id: alice.id })
    expect(label.error?.message).toMatch(/row-level security/i)

    const entry = await bob.client.from("time_entries").insert({
      description: "Planted",
      started_at: at(1),
      ended_at: at(0),
      user_id: alice.id,
    })
    expect(entry.error?.message).toMatch(/row-level security/i)

    // Moving his own entry over to her, by changing its owner, is refused too.
    const own = await bob.client
      .from("time_entries")
      .insert({ description: "Mine", started_at: at(1), ended_at: at(0) })
      .select("id")
      .single()
    expect(own.error).toBeNull()
    const moved = await bob.client
      .from("time_entries")
      .update({ user_id: alice.id })
      .eq("id", own.data!.id)
    expect(moved.error?.message).toMatch(/row-level security/i)

    await expectAliceUntouched()
  })

  test("his entries can't use her labels", async () => {
    // Through the app: an entry of his with her label in it.
    await expect(
      bob.api.saveEntry(
        {
          id: crypto.randomUUID(),
          description: `Mine #<label:${aliceLabel.id}>`,
          labelIds: [aliceLabel.id],
          startedAt: at(1),
          endedAt: at(0),
        },
        true
      )
    ).rejects.toThrow()

    // By hand: linking her label to an entry of his. The composite key keeps a link and its label
    // under one user, so this can't pass, whoever the link claims to belong to.
    const own = await bob.client
      .from("time_entries")
      .insert({ description: "Mine too", started_at: at(1), ended_at: at(0) })
      .select("id")
      .single()
    const link = await bob.client
      .from("time_entry_labels")
      .insert({ entry_id: own.data!.id, label_id: aliceLabel.id })
    expect(link.error).not.toBeNull()

    // Nor can he link his own label to her entry.
    const mine = { id: crypto.randomUUID(), name: "Bob's", color: "#d97706" }
    await bob.api.createLabel(mine)
    const reverse = await bob.client
      .from("time_entry_labels")
      .insert({ entry_id: aliceEntry.id, label_id: mine.id })
    expect(reverse.error).not.toBeNull()

    await expectAliceUntouched()
  })

  test("the same label name is fine: names are unique per user, not across users", async () => {
    await bob.api.createLabel({ id: crypto.randomUUID(), name: aliceLabel.name, color: "#7c3aed" })
    expect((await bob.api.listLabels()).map((label) => label.name)).toContain(aliceLabel.name)
    await expectAliceUntouched()
  })

  test("and his own changes never show up for her", async () => {
    const all = await admin().from("time_entries").select("user_id").eq("user_id", bob.id)
    expect(all.data!.length).toBeGreaterThan(0)
    expect(asInstants(await alice.api.listEntries({ labelIds: [] }))).toEqual(asInstants([aliceEntry]))
  })
})
