import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { expect, test } from "vitest"
import { Tracker } from "@/components/tracker"
import type { Entry, Label } from "@/lib/api"
import { createFakeApi } from "./fake-api"

let approve = false
const agent = createAgent({ allow: (step) => !step.confirm || approve })

const work: Label = { id: "work", name: "Work", color: "#2563eb" }
const admin: Label = { id: "admin", name: "Admin", color: "#16a34a" }

const at = (day: number, hour: number, minute = 0, second = 0) =>
  new Date(2026, 10, day, hour, minute, second).toISOString()

const entries: Entry[] = [
  { id: "e1", description: "Write report", labelIds: ["work"], startedAt: at(10, 9), endedAt: at(10, 10, 30) },
  { id: "e2", description: "Invoices", labelIds: ["admin"], startedAt: at(10, 14, 0, 20), endedAt: at(10, 14, 30, 20) },
  { id: "e3", description: "Planning", labelIds: ["work", "admin"], startedAt: at(12, 9), endedAt: at(12, 10) },
  { id: "e4", description: "", labelIds: [], startedAt: at(12, 11), endedAt: at(12, 11, 15) },
]

async function setup(seed = { labels: [work, admin], entries }) {
  const fake = createFakeApi(seed)
  const user = userEvent.setup()
  render(<Tracker api={fake.api} />)
  await screen.findByRole("region", { name: "Summary" })
  return { ...fake, user }
}

const summary = () => within(screen.getByRole("region", { name: "Summary" }))

test("shows the total, the time by label and daily subtotals", async () => {
  await setup()

  expect(summary().getByText("3h 15m")).toBeTruthy()
  expect(summary().getByText("4 entries")).toBeTruthy()
  const byLabel = within(summary().getByRole("list", { name: "Time by label" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent)
  expect(byLabel).toEqual(["Work2h 30m", "Admin1h 30m", "No label15m"])

  const days = screen.getAllByRole("region").filter((region) => region.querySelector("h2[id^=day-]"))
  expect(days).toHaveLength(2)
  expect(within(days[0]).getByText("1h 15m")).toBeTruthy()
  expect(within(days[1]).getByText("2h 00m")).toBeTruthy()
  expect(within(days[0]).getByText("No description")).toBeTruthy()
})

test("starts a timer with a description and stops it", async () => {
  const { user, entries } = await setup({ labels: [work], entries: [] })

  await user.type(screen.getByRole("textbox", { name: "What are you working on?" }), "Deep work")
  await user.click(screen.getByRole("button", { name: "Start timer" }))

  expect(await screen.findByRole("timer", { name: "Elapsed time" })).toBeTruthy()
  expect(screen.getByText("Deep work")).toBeTruthy()
  expect(screen.queryByRole("button", { name: "Start timer" })).toBeNull()
  expect(entries()).toMatchObject([{ description: "Deep work", endedAt: null }])
  expect(summary().getByText("0 entries")).toBeTruthy()

  await user.click(screen.getByRole("button", { name: "Stop timer" }))

  expect(await screen.findByRole("button", { name: "Start timer" })).toBeTruthy()
  expect(entries()[0].endedAt).not.toBeNull()
  expect(summary().getByText("1 entry")).toBeTruthy()
  expect(screen.getByRole("textbox", { name: "What are you working on?" })).toHaveProperty("value", "")
})

test("creates a label while typing and starts the timer with it", async () => {
  const { user, entries, labels } = await setup({ labels: [work], entries: [] })

  await user.type(screen.getByRole("combobox", { name: "Timer labels" }), "Research")
  await user.click(await screen.findByRole("option", { name: /Create “Research”/ }))
  await screen.findByRole("button", { name: "Remove Research" })
  await user.click(screen.getByRole("button", { name: "Start timer" }))

  await screen.findByRole("timer")
  const created = labels().find((label) => label.name === "Research")
  expect(created?.color).toMatch(/^#[0-9a-f]{6}$/)
  expect(entries()[0].labelIds).toEqual([created?.id])
  expect(within(screen.getByRole("list", { name: "Timer labels" })).getByText("Research")).toBeTruthy()
})

test("the timer can't start while a label is still being created", async () => {
  const fake = createFakeApi({ labels: [work], entries: [] })
  const createLabel = fake.api.createLabel
  let finish = () => {}
  fake.api.createLabel = async (name, color) => {
    await new Promise<void>((resolve) => (finish = resolve))
    return createLabel(name, color)
  }
  const user = userEvent.setup()
  render(<Tracker api={fake.api} />)
  await screen.findByRole("region", { name: "Summary" })

  await user.type(screen.getByRole("combobox", { name: "Timer labels" }), "Research")
  const start = screen.getByRole("button", { name: "Start timer" })
  const create = await screen.findByRole("option", { name: /Create “Research”/ })
  // Both presses land in one task, before the button has rendered as disabled.
  act(() => {
    create.click()
    start.click()
  })
  expect(fake.entries()).toEqual([])
  await waitFor(() => expect(start.getAttribute("aria-disabled")).toBe("true"))
  await user.click(start)
  expect(fake.entries()).toEqual([])

  finish()
  await screen.findByRole("button", { name: "Remove Research" })
  expect(start.getAttribute("aria-disabled")).toBeNull()
  await user.click(start)
  await screen.findByRole("timer")
  expect(fake.entries()[0].labelIds).toHaveLength(1)
})

test("filters by label, matching entries with any selected label", async () => {
  const { user } = await setup()

  await user.click(screen.getByRole("combobox", { name: "Filter labels" }))
  await user.click(await screen.findByRole("option", { name: "Admin" }))

  await waitFor(() => expect(summary().getByText("2 entries")).toBeTruthy())
  expect(screen.getByText("Invoices")).toBeTruthy()
  expect(screen.getByText("Planning")).toBeTruthy()
  expect(screen.queryByText("Write report")).toBeNull()

  await user.click(await screen.findByRole("option", { name: "Work" }))
  await waitFor(() => expect(summary().getByText("3 entries")).toBeTruthy())
  expect(screen.queryByText("No description")).toBeNull()
})

test("filters by a date range that includes both days", async () => {
  const { user } = await setup()

  await user.type(screen.getByRole("textbox", { name: "From date" }), "11/10/2026")
  await user.type(screen.getByRole("textbox", { name: "To date" }), "11/10/2026{Enter}")

  await waitFor(() => expect(summary().getByText("2 entries")).toBeTruthy())
  expect(summary().getByText("2h 00m")).toBeTruthy()
  expect(screen.queryByText("Planning")).toBeNull()

  await user.click(screen.getByRole("button", { name: "Clear dates" }))
  await waitFor(() => expect(summary().getByText("4 entries")).toBeTruthy())
})

test("says when no entry matches the filters", async () => {
  const { user } = await setup({ labels: [work, admin], entries: [entries[0]] })

  await user.click(screen.getByRole("combobox", { name: "Filter labels" }))
  await user.click(await screen.findByRole("option", { name: "Admin" }))

  expect(await screen.findByText("No entries match these filters.")).toBeTruthy()
})

test("edits an entry's description and keeps its times", async () => {
  const { user, entries: stored } = await setup()

  await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  const description = dialog.getByRole("textbox", { name: "Entry description" })
  expect(description).toHaveProperty("value", "Invoices")
  await user.clear(description)
  await user.type(description, "Send invoices")
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(await screen.findByText("Send invoices")).toBeTruthy()
  expect(stored().find((entry) => entry.id === "e2")).toEqual({
    ...entries[1],
    description: "Send invoices",
  })
})

test("cancel closes the dialog without saving", async () => {
  const { user, entries: stored } = await setup()

  await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  await user.type(dialog.getByRole("textbox", { name: "Entry description" }), " changed")
  await user.click(dialog.getByRole("button", { name: "Cancel" }))

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(stored()).toEqual(entries)
})

test("adds a past entry by hand, one hour long by default", async () => {
  const { user, entries: stored } = await setup({ labels: [work], entries: [] })

  await user.click(screen.getByRole("button", { name: "Add entry" }))
  const dialog = within(await screen.findByRole("dialog", { name: "Add entry" }))
  await user.type(dialog.getByRole("textbox", { name: "Entry description" }), "Workshop")
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  expect(await screen.findByText("Workshop")).toBeTruthy()
  const [saved] = stored()
  expect(Date.parse(saved.endedAt!) - Date.parse(saved.startedAt)).toBe(3_600_000)
  expect(summary().getByText("1 entry")).toBeTruthy()
})

test("changing a time saves it, and leaves the other one alone", async () => {
  const { user, entries: stored } = await setup()

  await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  const end = within(dialog.getByRole("group", { name: "Ended at" }))
  await user.click(end.getByRole("spinbutton", { name: /hour/i }))
  await user.keyboard("3")
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(stored().find((entry) => entry.id === "e2")).toMatchObject({
    startedAt: at(10, 14, 0, 20),
    endedAt: at(10, 15, 30),
  })
})

test("refuses an end before the start", async () => {
  const { user, entries: stored } = await setup()

  await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  const end = within(dialog.getByRole("group", { name: "Ended at" }))
  await user.click(end.getByRole("spinbutton", { name: /hour/i }))
  await user.keyboard("1")
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  expect(await dialog.findByText("The end can't be before the start.")).toBeTruthy()
  expect(stored()).toEqual(entries)
})

test("deleting asks first, and keeps the entry on cancel", async () => {
  const { user, entries: stored } = await setup()

  await user.click(screen.getByRole("button", { name: /^Delete Invoices at/ }))
  await user.click(await screen.findByRole("button", { name: "Keep entry" }))
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  expect(stored()).toHaveLength(4)

  await user.click(screen.getByRole("button", { name: /^Delete Invoices at/ }))
  await user.click(await screen.findByRole("button", { name: "Delete forever" }))
  await waitFor(() => expect(screen.queryByText("Invoices")).toBeNull())
  expect(stored().map((entry) => entry.id)).toEqual(["e1", "e3", "e4"])
  expect(summary().getByText("3 entries")).toBeTruthy()
})

test("an agent can find every control, start and stop a timer, and needs a person to delete", async () => {
  const { entries: stored } = await setup()

  const components = agent
    .snapshot()
    .filter((entry) => !entry.offPage && entry.component !== "more")
  for (const entry of components) {
    expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy()
  }
  const labels = components.map((entry) => entry.label)
  for (const label of [
    "What are you working on?",
    "Timer labels",
    "Start timer",
    "Filter labels",
    "Add entry",
  ]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label)
  }
  expect(labels.some((label) => label?.startsWith("Edit Invoices at"))).toBe(true)

  const started = await agent.act({
    steps: [
      { ref: "What are you working on?", action: "setValue", args: ["Agent task"] },
      { ref: "Timer labels", action: "setValue", args: [["work"]] },
      { ref: "Start timer", action: "press" },
    ],
  })
  expect(started.ok, started.error?.message).toBe(true)
  await screen.findByRole("timer")
  expect(stored().find((entry) => entry.endedAt === null)).toMatchObject({
    description: "Agent task",
    labelIds: ["work"],
  })

  const stopped = await agent.act({ steps: [{ ref: "Stop timer", action: "press" }] })
  expect(stopped.ok, stopped.error?.message).toBe(true)
  await screen.findByRole("button", { name: "Start timer" })
  expect(stored().every((entry) => entry.endedAt !== null)).toBe(true)

  const remove = {
    steps: [
      { ref: "Delete Invoices", action: "press" },
      { ref: "Delete this entry?", action: "press", args: ["Delete forever"] },
    ],
  }
  expect((await agent.act(remove)).ok).toBe(false)
  expect(stored().some((entry) => entry.id === "e2")).toBe(true)
  await agent.act({ steps: [{ ref: "Delete this entry?", action: "press", args: ["Keep entry"] }] })
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())

  approve = true
  const removed = await agent.act(remove)
  expect(removed.ok, removed.error?.message).toBe(true)
  await waitFor(() => expect(stored().some((entry) => entry.id === "e2")).toBe(false))
})
