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

test("the idle card shows only the start button; the details appear once it runs", async () => {
  const { user, entries } = await setup({ labels: [work], entries: [] })

  const card = screen.getByRole("region", { name: "Timer" })
  expect(within(card).getAllByRole("button").map((button) => button.getAttribute("aria-label"))).toEqual([
    "Start timer",
  ])
  expect(card.querySelector("[inert]")).not.toBeNull()

  await user.click(screen.getByRole("button", { name: "Start timer" }))

  expect(await screen.findByRole("timer", { name: "Elapsed time" })).toBeTruthy()
  expect(entries()).toMatchObject([{ description: "", labelIds: [], endedAt: null }])
  expect(card.querySelector("[inert]")).toBeNull()
  expect(card.hasAttribute("data-running")).toBe(true)
  expect(screen.getByRole("textbox", { name: "What are you working on?" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "Choose timer labels" })).toBeTruthy()
  expect(summary().getByText("0 entries")).toBeTruthy()
})

test("the description saves while the timer runs, and Stop saves what was just typed", async () => {
  const { user, entries } = await setup({ labels: [work], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  const description = await screen.findByRole("textbox", { name: "What are you working on?" })

  await user.type(description, "Deep work")
  await waitFor(() => expect(entries()[0].description).toBe("Deep work"))
  expect(entries()[0].endedAt).toBeNull()

  // No pause and no blur, as with a keyboard shortcut or an agent: Stop must save what was typed first.
  await user.type(description, " and review")
  const stop = screen.getByRole("button", { name: "Stop timer" })
  act(() => stop.click())

  expect(await screen.findByRole("button", { name: "Start timer" })).toBeTruthy()
  expect(entries()[0]).toMatchObject({ description: "Deep work and review" })
  expect(entries()[0].endedAt).not.toBeNull()
  expect(summary().getByText("1 entry")).toBeTruthy()
  expect(screen.getByText("Deep work and review")).toBeTruthy()
  expect(screen.getByRole("region", { name: "Timer" }).querySelector("[inert]")).not.toBeNull()
})

// The timer card's labels popup: a filter field inside it, the labels as options, and a Create option.
async function openTimerLabels(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Choose timer labels" }))
  return screen.findByRole("combobox", { name: "Find or create a label" })
}

test("labels are toggled from the popup, and saved on the running entry", async () => {
  const { user, entries } = await setup({ labels: [work, admin], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await screen.findByRole("timer")

  const filter = await openTimerLabels(user)
  expect(document.activeElement).toBe(filter)
  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Admin", "Work"])
  await user.click(screen.getByRole("option", { name: "Work" }))

  await waitFor(() => expect(entries()[0].labelIds).toEqual(["work"]))
  expect(screen.getByRole("option", { name: "Work" }).getAttribute("aria-selected")).toBe("true")
  expect(within(screen.getByRole("list", { name: "Timer labels" })).getByText("Work")).toBeTruthy()

  await user.click(screen.getByRole("option", { name: "Work" }))
  await waitFor(() => expect(entries()[0].labelIds).toEqual([]))
  expect(screen.queryByRole("list", { name: "Timer labels" })).toBeNull()
})

test("typing in the popup filters the labels", async () => {
  const { user } = await setup({ labels: [work, admin], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  const filter = await openTimerLabels(user)

  await user.type(filter, "wo")

  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
    "Work",
    "Create “wo”",
  ])

  await user.keyboard("{Escape}")
  await waitFor(() => expect(screen.queryByRole("combobox", { name: "Find or create a label" })).toBeNull())
  const reopened = await openTimerLabels(user)
  expect(reopened).toHaveProperty("value", "")
  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Admin", "Work"])
})

test("a name that matches no label can be created from the popup, and is added to the timer", async () => {
  const { user, entries, labels } = await setup({ labels: [work], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  const filter = await openTimerLabels(user)

  await user.type(filter, "Research")
  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Create “Research”"])
  await user.keyboard("{Enter}")

  const created = labels().find((label) => label.name === "Research")
  expect(created?.color).toMatch(/^#[0-9a-f]{6}$/)
  await waitFor(() => expect(entries()[0].labelIds).toEqual([created?.id]))
  expect(within(screen.getByRole("list", { name: "Timer labels" })).getByText("Research")).toBeTruthy()
  expect(filter).toHaveProperty("value", "")
  expect(screen.getByRole("option", { name: "Research" }).getAttribute("aria-selected")).toBe("true")
})

test("an exact match offers no Create, whatever the case", async () => {
  const { user, labels } = await setup({ labels: [work], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  const filter = await openTimerLabels(user)

  await user.type(filter, "work")

  expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Work"])
  await user.keyboard("{Enter}")
  expect(labels()).toEqual([work])
})

test("L opens the labels popup while the timer runs, and does nothing while it's stopped", async () => {
  const { user } = await setup({ labels: [work], entries: [] })

  await user.keyboard("l")
  expect(screen.queryByRole("combobox", { name: "Find or create a label" })).toBeNull()

  // After a stop the card is still on screen while it collapses: L must not open its popup.
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await screen.findByRole("timer")
  await user.tab()
  await user.click(screen.getByRole("button", { name: "Stop timer" }))
  await user.keyboard("l")
  expect(screen.queryByRole("combobox", { name: "Find or create a label" })).toBeNull()

  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await screen.findByRole("timer")
  await user.tab()
  expect(screen.getByRole("button", { name: "Choose timer labels" }).getAttribute("aria-keyshortcuts")).toBe("L")
  await user.keyboard("l")

  const filter = await screen.findByRole("combobox", { name: "Find or create a label" })
  await waitFor(() => expect(document.activeElement).toBe(filter))
  expect(filter).toHaveProperty("value", "")
})

test("typing an L in the description doesn't open the labels popup", async () => {
  const { user } = await setup({ labels: [work], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  const description = screen.getByRole("textbox", { name: "What are you working on?" })

  await user.type(description, "Planning")

  expect(description).toHaveProperty("value", "Planning")
  expect(screen.queryByRole("combobox", { name: "Find or create a label" })).toBeNull()
})

test("the running card has no edit button, and its description takes focus on start", async () => {
  const { user } = await setup({ labels: [], entries: [] })

  await user.click(screen.getByRole("button", { name: "Start timer" }))

  const card = within(screen.getByRole("region", { name: "Timer" }))
  expect(card.queryByRole("button", { name: /edit/i })).toBeNull()
  const description = card.getByRole("textbox", { name: "What are you working on?" })
  await waitFor(() => expect(document.activeElement).toBe(description))
})

test("starting with S focuses the description without typing the S into it", async () => {
  const { user, entries: stored } = await setup({ labels: [], entries: [] })

  await user.keyboard("s")
  const description = screen.getByRole("textbox", { name: "What are you working on?" })
  await waitFor(() => expect(document.activeElement).toBe(description))
  expect(description).toHaveProperty("value", "")

  await user.keyboard("Review")
  expect(description).toHaveProperty("value", "Review")
  await waitFor(() => expect(stored()[0]).toMatchObject({ description: "Review", endedAt: null }))
})

test("a timer already running when the page opens doesn't take focus", async () => {
  const runningEntry: Entry = {
    id: "r1",
    description: "From before",
    labelIds: [],
    startedAt: new Date(Date.now() - 60_000).toISOString(),
    endedAt: null,
  }
  await setup({ labels: [], entries: [runningEntry] })

  const description = await screen.findByRole("textbox", { name: "What are you working on?" })
  expect(description).toHaveProperty("value", "From before")
  expect(document.activeElement).not.toBe(description)
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
  for (const label of ["Start timer", "Filter labels", "Add entry"]) {
    expect(labels, `${label} is missing from the snapshot`).toContain(label)
  }
  expect(labels.some((label) => label?.startsWith("Edit Invoices at"))).toBe(true)

  const started = await agent.act({ steps: [{ ref: "Start timer", action: "press" }] })
  expect(started.ok, started.error?.message).toBe(true)
  await screen.findByRole("timer")
  const running = agent.snapshot().filter((entry) => !entry.offPage).map((entry) => entry.label)
  for (const label of ["Stop timer", "What are you working on?", "Choose timer labels"]) {
    expect(running, `${label} is missing once the timer runs`).toContain(label)
  }

  const described = await agent.act({
    steps: [
      { ref: "What are you working on?", action: "setValue", args: ["Agent task"] },
      { ref: "Choose timer labels", action: "setValue", args: [["Work"]] },
    ],
  })
  expect(described.ok, described.error?.message).toBe(true)
  await waitFor(() =>
    expect(stored().find((entry) => entry.endedAt === null)).toMatchObject({
      description: "Agent task",
      labelIds: ["work"],
    })
  )

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

test("start, typing, labels, stop and delete all show before the server answers", async () => {
  const { user, entries: stored, hold } = await setup({ labels: [work, admin], entries: [entries[1]] })
  const release = hold()

  await user.click(screen.getByRole("button", { name: "Start timer" }))
  expect(screen.getByRole("timer", { name: "Elapsed time" })).toBeTruthy()
  const description = screen.getByRole("textbox", { name: "What are you working on?" })
  await user.type(description, "Offline work")
  await openTimerLabels(user)
  await user.click(screen.getByRole("option", { name: "Work" }))
  await user.keyboard("{Escape}")
  await user.click(screen.getByRole("button", { name: "Stop timer" }))

  expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy()
  expect(screen.getByText("Offline work")).toBeTruthy()
  expect(summary().getByText("2 entries")).toBeTruthy()

  await user.click(screen.getByRole("button", { name: /^Delete Invoices at/ }))
  await user.click(await screen.findByRole("button", { name: "Delete forever" }))
  await waitFor(() => expect(screen.queryByText("Invoices")).toBeNull())
  expect(summary().getByText("1 entry")).toBeTruthy()
  expect(stored()).toEqual([entries[1]])

  release()
  await waitFor(() => expect(stored()).toHaveLength(1))
  await waitFor(() =>
    expect(stored()[0]).toMatchObject({ description: "Offline work", labelIds: ["work"] })
  )
  expect(stored()[0].endedAt).not.toBeNull()
  expect(screen.getByText("Offline work")).toBeTruthy()
})

test("a manual entry and a new label show at once, and save in order", async () => {
  const { user, entries: stored, labels, hold } = await setup({ labels: [], entries: [] })
  const release = hold()

  await user.click(screen.getByRole("button", { name: "Add entry" }))
  const dialog = within(await screen.findByRole("dialog", { name: "Add entry" }))
  await user.type(dialog.getByRole("textbox", { name: "Entry description" }), "Workshop")
  await user.type(dialog.getByRole("combobox", { name: "Entry labels" }), "Client")
  await user.click(await screen.findByRole("option", { name: /Create “Client”/ }))
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(screen.getByText("Workshop")).toBeTruthy()
  expect(within(summary().getByRole("list", { name: "Time by label" })).getByText("Client")).toBeTruthy()
  expect(stored()).toEqual([])

  release()
  await waitFor(() => expect(stored()).toHaveLength(1))
  expect(stored()[0].labelIds).toEqual([labels()[0].id])
})

test("a change the server refuses is undone, with a message", async () => {
  const { user, entries: stored, failNextWrite } = await setup()

  failNextWrite("Network down")
  await user.click(screen.getByRole("button", { name: /^Delete Invoices at/ }))
  await user.click(await screen.findByRole("button", { name: "Delete forever" }))

  expect(await screen.findByText("Network down")).toBeTruthy()
  expect(await screen.findByText("Invoices")).toBeTruthy()
  expect(summary().getByText("4 entries")).toBeTruthy()
  expect(stored()).toHaveLength(4)
})

test("writes reach the server in the order they were made, even when one is slow", async () => {
  const { user, entries: stored, labels, slowNextWrite } = await setup({ labels: [], entries: [] })

  slowNextWrite()
  await user.click(screen.getByRole("button", { name: "Add entry" }))
  const dialog = within(await screen.findByRole("dialog", { name: "Add entry" }))
  await user.type(dialog.getByRole("combobox", { name: "Entry labels" }), "Client")
  await user.click(await screen.findByRole("option", { name: /Create “Client”/ }))
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  await waitFor(() => expect(stored()).toHaveLength(1))
  expect(stored()[0].labelIds).toEqual([labels()[0].id])
  expect(screen.queryByText("Unknown label")).toBeNull()
})

test("a refresh that started before a change doesn't undo it on screen", async () => {
  const { user, entries: stored, holdReads } = await setup()

  const release = holdReads()
  document.dispatchEvent(new Event("visibilitychange"))
  await user.click(screen.getByRole("button", { name: /^Delete Invoices at/ }))
  await user.click(await screen.findByRole("button", { name: "Delete forever" }))
  await waitFor(() => expect(stored()).toHaveLength(3))

  release()
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(screen.queryByText("Invoices")).toBeNull()
  expect(summary().getByText("3 entries")).toBeTruthy()
})

test("start and stop send the moment the button was pressed, not when the server gets them", async () => {
  const { user, entries: stored, hold } = await setup({ labels: [], entries: [] })
  const release = hold()

  const beforeStart = Date.now()
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  const afterStart = Date.now()
  await new Promise((resolve) => setTimeout(resolve, 30))
  const beforeStop = Date.now()
  await user.click(screen.getByRole("button", { name: "Stop timer" }))
  const afterStop = Date.now()
  await new Promise((resolve) => setTimeout(resolve, 30))

  release()
  await waitFor(() => expect(stored()[0]?.endedAt).toBeTruthy())
  const startedAt = Date.parse(stored()[0].startedAt)
  const endedAt = Date.parse(stored()[0].endedAt!)
  expect(startedAt).toBeGreaterThanOrEqual(beforeStart)
  expect(startedAt).toBeLessThanOrEqual(afterStart)
  expect(endedAt).toBeGreaterThanOrEqual(beforeStop)
  expect(endedAt).toBeLessThanOrEqual(afterStop)
})

test("pressing S starts the timer and pressing it again stops it", async () => {
  const { user, entries: stored } = await setup({ labels: [], entries: [] })

  expect(screen.getByRole("button", { name: "Start timer" }).getAttribute("aria-keyshortcuts")).toBe("S")
  await user.keyboard("s")
  expect(screen.getByRole("timer", { name: "Elapsed time" })).toBeTruthy()
  await waitFor(() => expect(stored()).toHaveLength(1))

  // Starting puts focus in the description, where S is a letter; Tab leaves the field.
  await user.tab()
  await user.keyboard("s")
  expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy()
  await waitFor(() => expect(stored()[0].endedAt).not.toBeNull())
})

test("holding S down toggles once, not over and over", async () => {
  const { user, entries: stored } = await setup({ labels: [], entries: [] })

  await user.keyboard("{s>5/}")
  expect(screen.getByRole("button", { name: "Stop timer" })).toBeTruthy()
  await waitFor(() => expect(stored()).toHaveLength(1))
  expect(stored()[0].endedAt).toBeNull()
})

test("typing an S in the description doesn't stop the timer", async () => {
  const { user, entries: stored } = await setup({ labels: [], entries: [] })
  await user.keyboard("s")
  const description = screen.getByRole("textbox", { name: "What are you working on?" })

  await user.type(description, "Sales sync")

  expect(description).toHaveProperty("value", "Sales sync")
  expect(screen.getByRole("button", { name: "Stop timer" })).toBeTruthy()
  await waitFor(() => expect(stored()[0].description).toBe("Sales sync"))
  expect(stored()[0].endedAt).toBeNull()
})

test("S does nothing while a dialog is open", async () => {
  const { user, entries: stored } = await setup({ labels: [], entries: [] })

  await user.click(screen.getByRole("button", { name: "Add entry" }))
  await screen.findByRole("dialog", { name: "Add entry" })
  await user.keyboard("s")

  expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy()
  expect(stored()).toEqual([])
})
