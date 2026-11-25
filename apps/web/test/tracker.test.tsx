import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { OverlayHost } from "@ui-sdk/react/overlays"
import { useState } from "react"
import { expect, test, vi } from "vitest"
import { HistoryView, RECENT_LIMIT, TimerView } from "@/components/tracker"
import { emptyHistoryQuery, type HistoryQuery } from "@/lib/history-query"
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

// The timer page: the start/stop card and the most recent entries.
async function setup(seed = { labels: [work, admin], entries }) {
  const fake = createFakeApi(seed)
  const user = userEvent.setup()
  render(
    <>
      <TimerView api={fake.api} />
      <OverlayHost />
    </>
  )
  await screen.findByRole("heading", { name: "Recent" })
  await waitFor(() => expect(screen.queryByText("Loading entries…")).toBeNull())
  return { ...fake, user }
}

// The history page, with its filters held in state like the URL would hold them.
async function setupHistory(seed = { labels: [work, admin], entries }, initial: HistoryQuery = emptyHistoryQuery) {
  const fake = createFakeApi(seed)
  const user = userEvent.setup()
  const queries: HistoryQuery[] = []
  function Page() {
    const [query, setQuery] = useState(initial)
    return (
      <HistoryView
        api={fake.api}
        query={query}
        onQueryChange={(next) => {
          queries.push(next)
          setQuery(next)
        }}
      />
    )
  }
  render(
    <>
      <Page />
      <OverlayHost />
    </>
  )
  await screen.findByRole("region", { name: "Summary" })
  return { ...fake, user, queries }
}

const recent = () => within(screen.getByRole("region", { name: "Recent" }))

// Open an entry by its row, press Delete in the dialog, and answer the confirmation.
async function deleteFromDialog(user: ReturnType<typeof userEvent.setup>, row: RegExp, answer: "Delete forever" | "Keep entry") {
  await user.click(screen.getByRole("button", { name: row }))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  await user.click(dialog.getByRole("button", { name: "Delete" }))
  await user.click(await screen.findByRole("button", { name: answer }))
}

const summary = () => within(screen.getByRole("region", { name: "Summary" }))

test("shows the total, the time by label and daily subtotals", async () => {
  await setupHistory()

  expect(summary().getByText("3h 15m")).toBeTruthy()
  expect(summary().getByText("4 entries")).toBeTruthy()
  const byLabel = within(summary().getByRole("list", { name: "Time by label" }))
    .getAllByRole("listitem")
    .map((item) => item.textContent)
  expect(byLabel).toEqual(["Work2h 30m", "Admin1h 30m", "No label15m"])

  const days = within(screen.getByRole("list", { name: "Entries by day" })).getAllByRole("listitem", { name: /2026/ })
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
  expect(card.textContent).not.toMatch(/\d:\d\d:\d\d/)
  expect(screen.queryByRole("timer")).toBeNull()

  await user.click(screen.getByRole("button", { name: "Start timer" }))

  expect(await screen.findByRole("timer", { name: "Elapsed time" })).toBeTruthy()
  expect(screen.getByRole("timer").closest("[inert]")).toBeNull()
  expect(entries()).toMatchObject([{ description: "", labelIds: [], endedAt: null }])
  expect(card.querySelector("[inert]")).toBeNull()
  expect(card.hasAttribute("data-running")).toBe(true)
  expect(screen.getByRole("textbox", { name: "What are you working on?" })).toBeTruthy()
  expect(screen.getByRole("button", { name: "Choose timer labels" })).toBeTruthy()
  // The new timer is the first entry in Recent.
  expect(recent().queryByText("Nothing tracked yet. Press start to begin.")).toBeNull()
  expect(recent().getByText("No description").closest("[data-running]")).not.toBeNull()
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
  expect(recent().getByText("Deep work and review")).toBeTruthy()
  expect(screen.getByRole("region", { name: "Timer" }).querySelector("[inert]")).not.toBeNull()
  // The clock fades out with its last value, out of reach while it does.
  expect(screen.getByRole("timer").closest("[inert]")).not.toBeNull()
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
  const { user } = await setupHistory()

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
  const { user } = await setupHistory()

  await user.type(screen.getByRole("textbox", { name: "From date" }), "11/10/2026")
  await user.type(screen.getByRole("textbox", { name: "To date" }), "11/10/2026{Enter}")

  await waitFor(() => expect(summary().getByText("2 entries")).toBeTruthy())
  expect(summary().getByText("2h 00m")).toBeTruthy()
  expect(screen.queryByText("Planning")).toBeNull()

  await user.click(screen.getByRole("button", { name: "Clear dates" }))
  await waitFor(() => expect(summary().getByText("4 entries")).toBeTruthy())
})

test("says when no entry matches the filters", async () => {
  const { user } = await setupHistory({ labels: [work, admin], entries: [entries[0]] })

  await user.click(screen.getByRole("combobox", { name: "Filter labels" }))
  await user.click(await screen.findByRole("option", { name: "Admin" }))

  expect(await screen.findByText("No entries match these filters.")).toBeTruthy()
})

test("edits an entry's description and keeps its times", async () => {
  const { user, entries: stored } = await setupHistory()

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
  const { user, entries: stored } = await setupHistory()

  await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  await user.type(dialog.getByRole("textbox", { name: "Entry description" }), " changed")
  await user.click(dialog.getByRole("button", { name: "Cancel" }))

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(stored()).toEqual(entries)
})

test("adds a past entry by hand, one hour long by default", async () => {
  const { user, entries: stored } = await setupHistory({ labels: [work], entries: [] })

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
  const { user, entries: stored } = await setupHistory()

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
  const { user, entries: stored } = await setupHistory()

  await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  const end = within(dialog.getByRole("group", { name: "Ended at" }))
  await user.click(end.getByRole("spinbutton", { name: /hour/i }))
  await user.keyboard("1")
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  expect(await dialog.findByText("The end can't be before the start.")).toBeTruthy()
  expect(stored()).toEqual(entries)
})

test("deleting is in the dialog: it asks first, and keeps the entry on cancel", async () => {
  const { user, entries: stored } = await setupHistory()

  await deleteFromDialog(user, /^Edit Invoices at/, "Keep entry")
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  // Keeping the entry goes back to the edit dialog, not out of it.
  expect(screen.getByRole("dialog", { name: "Edit entry" })).toBeTruthy()
  expect(stored()).toHaveLength(4)
  await user.click(screen.getByRole("button", { name: "Cancel" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())

  await deleteFromDialog(user, /^Edit Invoices at/, "Delete forever")
  await waitFor(() => expect(screen.queryByText("Invoices")).toBeNull())
  // Both dialogs close once the entry is gone.
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(screen.queryByRole("alertdialog")).toBeNull()
  expect(stored().map((entry) => entry.id)).toEqual(["e1", "e3", "e4"])
  expect(summary().getByText("3 entries")).toBeTruthy()
  // Focus lands on the neighbouring row, not the top of the page.
  await waitFor(() =>
    expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^Edit Write report at/)
  )
})

test("rows have no edit or delete buttons of their own; the whole row opens the entry", async () => {
  const { user } = await setupHistory()

  expect(screen.queryByRole("button", { name: /^Delete / })).toBeNull()
  const rows = screen.getAllByRole("button", { name: /^Edit .* at / })
  expect(rows).toHaveLength(entries.length)
  const planning = screen.getByRole("button", { name: /^Edit Planning at/ })
  expect(planning.textContent).toContain("Planning")

  // A press anywhere on the row opens it, not only on its text.
  await user.click(within(planning).getByText("1h 00m"))
  const dialog = within(await screen.findByRole("dialog", { name: "Edit entry" }))
  expect(dialog.getByRole("textbox", { name: "Entry description" })).toHaveProperty("value", "Planning")
})

test("a new entry has no Delete in its dialog", async () => {
  const { user } = await setupHistory()

  await user.click(screen.getByRole("button", { name: "Add entry" }))
  const dialog = within(await screen.findByRole("dialog", { name: "Add entry" }))
  expect(dialog.queryByRole("button", { name: "Delete" })).toBeNull()
})

test("a row opens from the keyboard too", async () => {
  const { user } = await setupHistory()

  screen.getByRole("button", { name: /^Edit Invoices at/ }).focus()
  await user.keyboard("{Enter}")
  expect(await screen.findByRole("dialog", { name: "Edit entry" })).toBeTruthy()
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
  for (const label of ["Start timer", "Collapse all days"]) {
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
      { ref: "Edit Invoices", action: "press" },
      { ref: "Edit entry", action: "press", args: ["Delete"] },
      { ref: "Delete this entry?", action: "press", args: ["Delete forever"] },
    ],
  }
  expect((await agent.act(remove)).ok).toBe(false)
  expect(stored().some((entry) => entry.id === "e2")).toBe(true)
  await agent.act({ steps: [{ ref: "Delete this entry?", action: "press", args: ["Keep entry"] }] })
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull())
  await agent.act({ steps: [{ ref: "Edit entry", action: "press", args: ["Cancel"] }] })
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())

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
  expect(recent().getByText("Offline work")).toBeTruthy()
  expect(recent().getByText("Invoices")).toBeTruthy()

  await deleteFromDialog(user, /^Edit Invoices at/, "Delete forever")
  await waitFor(() => expect(screen.queryByText("Invoices")).toBeNull())
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
  const { user, entries: stored, labels, hold } = await setupHistory({ labels: [], entries: [] })
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
  const { user, entries: stored, failNextWrite } = await setupHistory()

  failNextWrite("Network down")
  await deleteFromDialog(user, /^Edit Invoices at/, "Delete forever")

  expect(await screen.findByText("Network down")).toBeTruthy()
  expect(await screen.findByText("Invoices")).toBeTruthy()
  expect(summary().getByText("4 entries")).toBeTruthy()
  expect(stored()).toHaveLength(4)
})

test("writes reach the server in the order they were made, even when one is slow", async () => {
  const { user, entries: stored, labels, slowNextWrite } = await setupHistory({ labels: [], entries: [] })

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
  const { user, entries: stored, holdReads } = await setupHistory()

  const release = holdReads()
  document.dispatchEvent(new Event("visibilitychange"))
  await deleteFromDialog(user, /^Edit Invoices at/, "Delete forever")
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
  const { user, entries: stored } = await setup({ labels: [], entries: [entries[1]] })

  await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
  await screen.findByRole("dialog", { name: "Edit entry" })
  await user.keyboard("s")

  expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy()
  expect(stored()).toEqual([entries[1]])
})

test("the timer page lists only the most recent entries, newest first", async () => {
  const many: Entry[] = Array.from({ length: RECENT_LIMIT + 3 }, (_, index) => ({
    id: `m${index}`,
    description: `Task ${index}`,
    labelIds: [],
    startedAt: at(1, 8, index),
    endedAt: at(1, 8, index, 30),
  }))
  await setup({ labels: [], entries: many })

  const shown = recent().getAllByText(/^Task \d+$/).map((item) => item.textContent)
  expect(shown).toHaveLength(RECENT_LIMIT)
  expect(shown[0]).toBe(`Task ${RECENT_LIMIT + 2}`)
  expect(shown).not.toContain("Task 0")
  expect(screen.queryByRole("region", { name: "Summary" })).toBeNull()
  expect(screen.queryByRole("combobox", { name: "Filter labels" })).toBeNull()
})

test("deleting from the recent list brings the next older entry in", async () => {
  const many: Entry[] = Array.from({ length: RECENT_LIMIT + 1 }, (_, index) => ({
    id: `m${index}`,
    description: `Task ${index}`,
    labelIds: [],
    startedAt: at(1, 8, index),
    endedAt: at(1, 8, index, 30),
  }))
  const { user } = await setup({ labels: [], entries: many })
  expect(recent().queryByText("Task 0")).toBeNull()

  await deleteFromDialog(user, /^Edit Task 5 at/, "Delete forever")

  await waitFor(() => expect(recent().getByText("Task 0")).toBeTruthy())
  expect(recent().queryByText("Task 5")).toBeNull()
  expect(recent().getAllByText(/^Task \d+$/)).toHaveLength(RECENT_LIMIT)
})

test("a newly stopped timer joins the top of the recent list, which stays the same length", async () => {
  const many: Entry[] = Array.from({ length: RECENT_LIMIT }, (_, index) => ({
    id: `m${index}`,
    description: `Task ${index}`,
    labelIds: [],
    startedAt: at(1, 8, index),
    endedAt: at(1, 8, index, 30),
  }))
  const { user, hold } = await setup({ labels: [], entries: many })

  // Before the server answers: the list on screen has to keep its length by itself.
  const release = hold()
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await user.type(screen.getByRole("textbox", { name: "What are you working on?" }), "Newest")
  await user.click(screen.getByRole("button", { name: "Stop timer" }))

  const shown = recent().getAllByText(/^(Task \d+|Newest)$/).map((item) => item.textContent)
  expect(shown[0]).toBe("Newest")
  expect(shown).toHaveLength(RECENT_LIMIT)
  expect(shown).not.toContain("Task 0")
  release()
})

test("the history page opens with the filters from its URL", async () => {
  await setupHistory(undefined, { range: ["2026-11-10", "2026-11-10"], labelIds: ["admin"] })

  await waitFor(() => expect(summary().getByText("1 entry")).toBeTruthy())
  expect(screen.getByText("Invoices")).toBeTruthy()
  expect(screen.getByRole("textbox", { name: "From date" })).toHaveProperty("value", "11/10/2026")
  expect(screen.getByRole("button", { name: "Remove Admin" })).toBeTruthy()
})

test("changing a filter reports the new query, for the URL", async () => {
  const { user, queries } = await setupHistory()

  await user.click(screen.getByRole("combobox", { name: "Filter labels" }))
  await user.click(await screen.findByRole("option", { name: "Admin" }))
  expect(queries.at(-1)).toEqual({ range: null, labelIds: ["admin"] })

  await user.type(screen.getByRole("textbox", { name: "From date" }), "11/10/2026")
  await user.type(screen.getByRole("textbox", { name: "To date" }), "11/12/2026{Enter}")
  await waitFor(() =>
    expect(queries.at(-1)).toEqual({ range: ["2026-11-10", "2026-11-12"], labelIds: ["admin"] })
  )
})

// ui-sdk picks a sheet for "(max-width: 640px) and (pointer: coarse)", a phone.
function pretendScreen(phone: boolean) {
  const original = window.matchMedia
  window.matchMedia = (query: string) =>
    ({
      matches: phone && /max-width|coarse/.test(query),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }) as MediaQueryList
  return () => {
    window.matchMedia = original
  }
}

test("on a phone the entry dialog is a bottom sheet", async () => {
  const restore = pretendScreen(true)
  try {
    const { user } = await setupHistory()
    await user.click(screen.getByRole("button", { name: /^Edit Invoices at/ }))
    const dialog = await screen.findByRole("dialog", { name: "Edit entry" })
    expect(dialog.getAttribute("data-presentation")).toBe("sheet")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  } finally {
    restore()
  }
})

test("on a larger or mouse-driven screen it stays a centered dialog", async () => {
  const restore = pretendScreen(false)
  try {
    const { user } = await setupHistory()
    await user.click(screen.getByRole("button", { name: "Add entry" }))
    const dialog = await screen.findByRole("dialog", { name: "Add entry" })
    expect(dialog.getAttribute("data-presentation")).toBe("dialog")
    await user.keyboard("{Escape}")
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  } finally {
    restore()
  }
})

// A timer that started 10 minutes ago, with the Work label.
const runningSince = (minutes: number, labelIds = ["work"]): Entry => ({
  id: "live",
  description: "Live work",
  labelIds,
  startedAt: new Date(Date.now() - minutes * 60_000).toISOString(),
  endedAt: null,
})

test("history lists the running timer, and its time keeps counting in the row and every total", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["setInterval", "clearInterval", "Date"] })
  // Midday, so the entry from hours ago is still today: early in the morning it'd be yesterday,
  // and the day's total would miss it.
  const midday = new Date()
  midday.setHours(12, 0, 0, 0)
  vi.setSystemTime(midday)
  try {
    const today = new Date().toISOString()
    const finished: Entry = {
      id: "done",
      description: "Done today",
      labelIds: [],
      startedAt: new Date(Date.parse(today) - 3 * 3_600_000).toISOString(),
      endedAt: new Date(Date.parse(today) - 2 * 3_600_000).toISOString(),
    }
    await setupHistory({ labels: [work], entries: [finished, runningSince(10)] })

    const row = screen.getByText("Live work").closest("[data-entry-id]") as HTMLElement
    expect(row.getAttribute("data-running")).toBe("")
    expect(row.textContent).toContain("now")
    expect(summary().getByText("2 entries")).toBeTruthy()
    expect(summary().getByText("1h 10m")).toBeTruthy()
    const byLabel = () =>
      within(summary().getByRole("list", { name: "Time by label" })).getAllByRole("listitem").map((item) => item.textContent)
    expect(byLabel()).toEqual(["Work10m", "No label1h 00m"])

    await act(async () => {
      vi.advanceTimersByTime(5 * 60_000)
    })
    expect(within(row).getByText("15m")).toBeTruthy()
    expect(summary().getByText("1h 15m")).toBeTruthy()
    expect(byLabel()).toEqual(["Work15m", "No label1h 00m"])
    const day = row.closest("[data-day]") as HTMLElement
    expect(within(day).getAllByText("1h 15m").length).toBeGreaterThan(0)
  } finally {
    vi.useRealTimers()
  }
})

test("the running row can't be opened: there is no button to edit or delete it", async () => {
  await setupHistory({ labels: [work], entries: [runningSince(10)] })

  expect(screen.getByText("Live work")).toBeTruthy()
  expect(screen.queryByRole("button", { name: /^Edit Live work/ })).toBeNull()
})

test("the running timer is left out when it doesn't match the filters", async () => {
  await setupHistory({ labels: [work, admin], entries: [entries[1], runningSince(10)] }, { range: null, labelIds: ["admin"] })

  await waitFor(() => expect(summary().getByText("1 entry")).toBeTruthy())
  expect(screen.queryByText("Live work")).toBeNull()
})

test("the timer page lists the running timer first in Recent, and it keeps counting", async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["setInterval", "clearInterval", "Date"] })
  try {
    await setup({ labels: [work], entries: [entries[0], runningSince(10)] })

    const rows = recent().getAllByText(/^(Live work|Write report)$/).map((item) => item.textContent)
    expect(rows).toEqual(["Live work", "Write report"])
    const row = recent().getByText("Live work").closest("[data-entry-id]") as HTMLElement
    expect(row.getAttribute("data-running")).toBe("")
    expect(within(row).getByText("10m")).toBeTruthy()
    expect(screen.queryByRole("button", { name: /^Edit Live work/ })).toBeNull()

    await act(async () => {
      vi.advanceTimersByTime(3 * 60_000)
    })
    expect(within(row).getByText("13m")).toBeTruthy()
  } finally {
    vi.useRealTimers()
  }
})

test("what's typed on the timer card shows in its Recent row as it's typed", async () => {
  const { user } = await setup({ labels: [work], entries: [] })

  await user.click(screen.getByRole("button", { name: "Start timer" }))
  expect(recent().getByText("No description")).toBeTruthy()
  await user.type(screen.getByRole("textbox", { name: "What are you working on?" }), "Planning")

  await waitFor(() => expect(recent().getByText("Planning")).toBeTruthy())
})

test("Recent keeps its length with a timer running, and Stop doesn't shift the rows", async () => {
  const many: Entry[] = Array.from({ length: RECENT_LIMIT }, (_, index) => ({
    id: `m${index}`,
    description: `Task ${index}`,
    labelIds: [],
    startedAt: at(1, 8, index),
    endedAt: at(1, 8, index, 30),
  }))
  const { user } = await setup({ labels: [], entries: many })
  const shown = () => recent().getAllByText(/^(Task \d+|Now)$/).map((item) => item.textContent)

  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await user.type(screen.getByRole("textbox", { name: "What are you working on?" }), "Now")
  await waitFor(() => expect(shown()[0]).toBe("Now"))
  const running = shown()
  expect(running).toHaveLength(RECENT_LIMIT)
  expect(running).not.toContain("Task 0")

  await user.click(screen.getByRole("button", { name: "Stop timer" }))
  expect(shown()).toEqual(running)
  expect(screen.getByRole("button", { name: /^Edit Now at/ })).toBeTruthy()
})

test("days are points on a timeline: named by the day, with arrow keys between them", async () => {
  const { user } = await setupHistory()

  const timeline = screen.getByRole("list", { name: "Entries by day" })
  const days = within(timeline).getAllByRole("listitem", { name: /2026/ })
  expect(days).toHaveLength(2)
  expect(days[0].getAttribute("aria-label") ?? days[0].textContent).toMatch(/November 12, 2026/)
  expect(within(days[0]).getByRole("heading", { level: 2 })).toBeTruthy()
  expect(days[0].querySelector("time")?.getAttribute("dateTime")).toBe("2026-11-12")

  // One tab stop for the days: only the first day is in the tab order, and Tab goes into its entries.
  expect(days.map((day) => day.tabIndex)).toEqual([0, -1])
  days[0].focus()
  await user.keyboard("{ArrowDown}")
  expect(document.activeElement).toBe(days[1])
  await user.keyboard("{ArrowUp}")
  expect(document.activeElement).toBe(days[0])
  // Tab goes from the day to its collapse button, then into its entries.
  await user.tab()
  expect(document.activeElement?.textContent).toMatch(/November 12, 2026/)
  expect(document.activeElement?.getAttribute("aria-expanded")).toBe("true")
  await user.tab()
  expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^Edit .* November 12, 2026$/)
})

const dayToggle = (day: RegExp) =>
  screen.getAllByRole("button", { name: day }).find((button) => button.hasAttribute("aria-expanded"))!

test("a day collapses and expands from its header, hiding its entries but keeping its total", async () => {
  const { user } = await setupHistory()

  const toggle = dayToggle(/November 10, 2026/)
  expect(toggle.getAttribute("aria-expanded")).toBe("true")
  expect(screen.getByText("Invoices")).toBeTruthy()

  await user.click(toggle)
  expect(toggle.getAttribute("aria-expanded")).toBe("false")
  await waitFor(() => expect(screen.queryByText("Invoices")).toBeNull())
  expect(screen.queryByText("Write report")).toBeNull()
  const day = toggle.closest("[data-day]") as HTMLElement
  expect(within(day).getByText("2h 00m")).toBeTruthy()
  // The other day is untouched.
  expect(screen.getByText("Planning")).toBeTruthy()
  // Summary totals still count the hidden entries.
  expect(summary().getByText("4 entries")).toBeTruthy()

  await user.click(toggle)
  expect(toggle.getAttribute("aria-expanded")).toBe("true")
  expect(await screen.findByText("Invoices")).toBeTruthy()
})

const expanded = () =>
  within(screen.getByRole("list", { name: "Entries by day" }))
    .getAllByRole("button")
    .filter((button) => button.hasAttribute("aria-expanded"))
    .map((button) => button.getAttribute("aria-expanded"))

test("C collapses every day, and expands them all again", async () => {
  const { user } = await setupHistory()
  expect(expanded()).toEqual(["true", "true"])

  await user.keyboard("c")
  expect(expanded()).toEqual(["false", "false"])
  await waitFor(() => expect(screen.queryByText("Invoices")).toBeNull())
  expect(screen.queryByText("Planning")).toBeNull()

  await user.keyboard("c")
  expect(expanded()).toEqual(["true", "true"])
  expect(await screen.findByText("Invoices")).toBeTruthy()
})

test("with some days already collapsed, C collapses the rest; once all are, C expands them", async () => {
  const { user } = await setupHistory()

  await user.click(dayToggle(/November 10, 2026/))
  expect(expanded()).toEqual(["true", "false"])

  await user.keyboard("c")
  expect(expanded()).toEqual(["false", "false"])
  await user.keyboard("c")
  expect(expanded()).toEqual(["true", "true"])
})

test("C from inside a day's entries keeps focus in the list, on that day", async () => {
  const { user } = await setupHistory()

  screen.getByRole("button", { name: /^Edit Invoices at/ }).focus()
  await user.keyboard("c")

  expect(expanded()).toEqual(["false", "false"])
  const day = dayToggle(/November 10, 2026/).closest("[data-day]")
  expect(document.activeElement).toBe(day)
})

test("the shortcut is announced on the list", async () => {
  await setupHistory()
  expect(screen.getByRole("list", { name: "Entries by day" }).getAttribute("aria-keyshortcuts")).toBe("C")
})

test("typing a C in a field doesn't collapse anything", async () => {
  const { user } = await setupHistory()

  await user.click(screen.getByRole("combobox", { name: "Filter labels" }))
  await user.keyboard("c")
  await user.keyboard("{Escape}")

  expect(dayToggle(/November 12, 2026/).getAttribute("aria-expanded")).toBe("true")
  expect(dayToggle(/November 10, 2026/).getAttribute("aria-expanded")).toBe("true")
})

test("a collapsed day stays collapsed when the list refreshes", async () => {
  const { user } = await setupHistory()

  await user.click(dayToggle(/November 10, 2026/))
  await act(async () => {
    document.dispatchEvent(new Event("visibilitychange"))
    await new Promise((resolve) => setTimeout(resolve, 20))
  })

  expect(dayToggle(/November 10, 2026/).getAttribute("aria-expanded")).toBe("false")
  expect(screen.queryByText("Invoices")).toBeNull()
})

const collapseAll = () => screen.getByRole("button", { name: "Collapse all days" })

test("the collapse-all toggle collapses every day, and is pressed while they're collapsed", async () => {
  const { user } = await setupHistory()
  expect(collapseAll().getAttribute("aria-pressed")).toBe("false")

  await user.click(collapseAll())
  expect(expanded()).toEqual(["false", "false"])
  expect(collapseAll().getAttribute("aria-pressed")).toBe("true")

  await user.click(collapseAll())
  expect(expanded()).toEqual(["true", "true"])
  expect(collapseAll().getAttribute("aria-pressed")).toBe("false")
})

test("the toggle follows C and the day headers", async () => {
  const { user } = await setupHistory()

  await user.keyboard("c")
  expect(collapseAll().getAttribute("aria-pressed")).toBe("true")

  // Opening one day means they're no longer all collapsed.
  await user.click(dayToggle(/November 10, 2026/))
  expect(collapseAll().getAttribute("aria-pressed")).toBe("false")

  // Collapsing it again by hand: all collapsed, so the toggle is pressed.
  await user.click(dayToggle(/November 10, 2026/))
  expect(collapseAll().getAttribute("aria-pressed")).toBe("true")
})

test("the timer page has the collapse-all toggle for its recent list", async () => {
  const { user } = await setup()

  await user.click(collapseAll())
  expect(expanded().every((value) => value === "false")).toBe(true)
  expect(recent().queryByText("Write report")).toBeNull()
})

test("there's no collapse-all toggle without entries", async () => {
  await setupHistory({ labels: [], entries: [] })
  expect(screen.queryByRole("button", { name: "Collapse all days" })).toBeNull()
})

test.each(["{Enter}", "{Escape}"])("%s in the description leaves it and saves, so S then stops", async (key) => {
  const { user, entries: stored } = await setup({ labels: [], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  const description = screen.getByRole("textbox", { name: "What are you working on?" })
  await waitFor(() => expect(document.activeElement).toBe(description))

  await user.type(description, "Review")
  await user.keyboard(key)
  expect(document.activeElement).not.toBe(description)
  // Saved at once, not after the typing pause.
  await waitFor(() => expect(stored()[0]).toMatchObject({ description: "Review", endedAt: null }))

  await user.keyboard("s")
  expect(description).toHaveProperty("value", "Review")
  await waitFor(() => expect(stored()[0].endedAt).not.toBeNull())
  expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy()
})

test("the timer page has no history button; the History tab is the way there", async () => {
  await setup()
  expect(await screen.findByRole("heading", { name: "Recent" })).toBeTruthy()
  expect(screen.queryByRole("link", { name: /history/i })).toBeNull()
  expect(screen.queryByRole("button", { name: /history/i })).toBeNull()
})
