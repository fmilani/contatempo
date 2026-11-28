import { act, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createAgent } from "@ui-sdk/react/agent"
import { OverlayHost } from "@ui-sdk/react/overlays"
import { useState } from "react"
import { expect, test, vi } from "vitest"
import { HistoryView, RECENT_DAYS, TimerView } from "@/components/tracker"
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

// Deletes an entry from the trash button at the end of its row.
async function deleteRow(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(screen.getByRole("button", { name: new RegExp(`^Delete ${name} at`) }))
}

// Types into a description editor, then picks the label menu's option named `option`.
async function pickLabel(user: ReturnType<typeof userEvent.setup>, typed: string, option: string | RegExp) {
  await user.keyboard(typed)
  await user.click(await screen.findByRole("option", { name: option }))
}

const timerDescription = () => screen.getByRole("textbox", { name: "What are you working on?" })
const optionNames = () => screen.queryAllByRole("option").map((option) => option.textContent)
// The label menu lists its options a moment after a key: waits until they're `names`.
const expectOptions = (names: string[]) => waitFor(() => expect(optionNames()).toEqual(names))

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
  // Labels are typed into the description: there's no labels button.
  expect(screen.queryByRole("button", { name: /labels/i })).toBeNull()
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
  expect(description).toHaveProperty("textContent", "")

  await user.keyboard("Review")
  expect(description).toHaveProperty("textContent", "Review")
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
  expect(description).toHaveProperty("textContent", "From before")
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
  expect(labels.some((label) => label?.startsWith("Change description of Invoices at"))).toBe(true)

  const started = await agent.act({ steps: [{ ref: "Start timer", action: "press" }] })
  expect(started.ok, started.error?.message).toBe(true)
  await screen.findByRole("timer")
  const running = agent.snapshot().filter((entry) => !entry.offPage).map((entry) => entry.label)
  for (const label of ["Stop timer", "What are you working on?"]) {
    expect(running, `${label} is missing once the timer runs`).toContain(label)
  }

  const described = await agent.act({
    steps: [{ ref: "What are you working on?", action: "setValue", args: ["Agent task #<label:work>"] }],
  })
  expect(described.ok, described.error?.message).toBe(true)
  await waitFor(() =>
    expect(stored().find((entry) => entry.endedAt === null)).toMatchObject({
      description: "Agent task #<label:work>",
      labelIds: ["work"],
    })
  )

  const stopped = await agent.act({ steps: [{ ref: "Stop timer", action: "press" }] })
  expect(stopped.ok, stopped.error?.message).toBe(true)
  await screen.findByRole("button", { name: "Start timer" })
  expect(stored().every((entry) => entry.endedAt !== null)).toBe(true)

  // Planning's day is still among the recent ones now that today has an entry.
  const remove = { steps: [{ ref: "Delete Planning", action: "press" }] }
  expect((await agent.act(remove)).ok).toBe(false)
  expect(stored().some((entry) => entry.id === "e3")).toBe(true)

  approve = true
  const removed = await agent.act(remove)
  expect(removed.ok, removed.error?.message).toBe(true)
  await waitFor(() => expect(stored().some((entry) => entry.id === "e3")).toBe(false))
})

test("start, typing, labels, stop and delete all show before the server answers", async () => {
  const { user, entries: stored, hold } = await setup({ labels: [work, admin], entries: [entries[1]] })
  const release = hold()

  await user.click(screen.getByRole("button", { name: "Start timer" }))
  expect(screen.getByRole("timer", { name: "Elapsed time" })).toBeTruthy()
  const description = screen.getByRole("textbox", { name: "What are you working on?" })
  await user.type(description, "Offline work ")
  await pickLabel(user, "#wo", "Work")
  await user.click(screen.getByRole("button", { name: "Stop timer" }))

  expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy()
  expect(recent().getByRole("button", { name: /^Change description of Offline work #Work at/ })).toBeTruthy()
  expect(recent().getByText("Invoices")).toBeTruthy()

  await deleteRow(user, "Invoices")
  await waitFor(() => expect(screen.queryByText("Invoices")).toBeNull())
  expect(stored()).toEqual([entries[1]])

  release()
  await waitFor(() => expect(stored()).toHaveLength(1))
  await waitFor(() =>
    expect(stored()[0]).toMatchObject({ description: "Offline work #<label:work>", labelIds: ["work"] })
  )
  expect(stored()[0].endedAt).not.toBeNull()
})

test("a manual entry and a new label show at once, and save in order", async () => {
  const { user, entries: stored, labels, hold } = await setupHistory({ labels: [], entries: [] })
  const release = hold()

  await user.click(screen.getByRole("button", { name: "Add entry" }))
  const dialog = within(await screen.findByRole("dialog", { name: "Add entry" }))
  await user.click(dialog.getByRole("textbox", { name: "Entry description" }))
  await user.keyboard("Workshop ")
  await pickLabel(user, "#Client", /Create “Client”/)
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(screen.getByRole("button", { name: /^Change description of Workshop #Client at/ })).toBeTruthy()
  expect(within(summary().getByRole("list", { name: "Time by label" })).getByText("Client")).toBeTruthy()
  expect(stored()).toEqual([])

  release()
  await waitFor(() => expect(stored()).toHaveLength(1))
  expect(stored()[0]).toMatchObject({
    description: `Workshop #<label:${labels()[0].id}>`,
    labelIds: [labels()[0].id],
  })
})

test("a change the server refuses is undone, with a message", async () => {
  const { user, entries: stored, failNextWrite } = await setupHistory()

  failNextWrite("Network down")
  await deleteRow(user, "Invoices")

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
  await user.click(dialog.getByRole("textbox", { name: "Entry description" }))
  await pickLabel(user, "#Client", /Create “Client”/)
  await user.click(dialog.getByRole("button", { name: "Save entry" }))

  await waitFor(() => expect(stored()).toHaveLength(1))
  expect(stored()[0].labelIds).toEqual([labels()[0].id])
  expect(screen.queryByText("unknown label")).toBeNull()
})

test("a refresh that started before a change doesn't undo it on screen", async () => {
  const { user, entries: stored, holdReads } = await setupHistory()

  const release = holdReads()
  document.dispatchEvent(new Event("visibilitychange"))
  await deleteRow(user, "Invoices")
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

  expect(description).toHaveProperty("textContent", "Sales sync")
  expect(screen.getByRole("button", { name: "Stop timer" })).toBeTruthy()
  await waitFor(() => expect(stored()[0].description).toBe("Sales sync"))
  expect(stored()[0].endedAt).toBeNull()
})

test("S does nothing while a dialog is open", async () => {
  const { user, entries: stored } = await setupHistory({ labels: [], entries: [entries[1]] })

  await user.click(screen.getByRole("button", { name: "Add entry" }))
  await screen.findByRole("dialog", { name: "Add entry" })
  // Out of the description, so S isn't typed into it.
  screen.getByRole("dialog").focus()
  await user.keyboard("s")

  expect(stored()).toEqual([entries[1]])
})

// Entries on three days with a gap between them: one on Nov 1, two on Nov 3 and two on Nov 5.
const spread: Entry[] = [1, 3, 3, 5, 5].map((day, index) => ({
  id: `d${index}`,
  description: `Task ${index}`,
  labelIds: [],
  startedAt: at(day, 8 + index),
  endedAt: at(day, 8 + index, 30),
}))
const shownTasks = () => recent().queryAllByText(/^(Task \d+|Now)$/).map((item) => item.textContent)
const shownDays = () =>
  within(screen.getByRole("list", { name: "Entries by day" })).getAllByRole("listitem", { name: /2026/ })

test("the timer page lists every entry of the two most recent days with entries, newest first", async () => {
  await setup({ labels: [], entries: spread })

  expect(shownTasks()).toEqual(["Task 4", "Task 3", "Task 2", "Task 1"])
  expect(shownDays()).toHaveLength(RECENT_DAYS)
  expect(screen.queryByRole("region", { name: "Summary" })).toBeNull()
  expect(screen.queryByRole("combobox", { name: "Filter labels" })).toBeNull()
})

test("deleting the last entry of a recent day brings the next older day in", async () => {
  const { user } = await setup({ labels: [], entries: spread.filter((entry) => entry.id !== "d2") })
  expect(shownTasks()).toEqual(["Task 4", "Task 3", "Task 1"])

  await deleteRow(user, "Task 1")

  await waitFor(() => expect(shownTasks()).toEqual(["Task 4", "Task 3", "Task 0"]))
})

test("a timer started today makes today a recent day, and Stop doesn't change the list", async () => {
  const { user, hold } = await setup({ labels: [], entries: spread })

  // Before the server answers: the list on screen has to keep to two days by itself.
  const release = hold()
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await user.type(timerDescription(), "Now")
  // The row shows the description once it saves, a moment after typing pauses.
  await waitFor(() => expect(shownTasks()).toEqual(["Now", "Task 4", "Task 3"]))

  await user.click(screen.getByRole("button", { name: "Stop timer" }))
  expect(shownTasks()).toEqual(["Now", "Task 4", "Task 3"])
  release()
  await waitFor(() => expect(screen.getByRole("button", { name: /^Change description of Now at/ })).toBeTruthy())
  expect(shownTasks()).toEqual(["Now", "Task 4", "Task 3"])
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
    await user.click(screen.getByRole("button", { name: "Add entry" }))
    const dialog = await screen.findByRole("dialog", { name: "Add entry" })
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
  expect(document.activeElement?.getAttribute("aria-label")).toMatch(/^Change start time of .* November 12, 2026$/)
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

  startOf("Invoices").focus()
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
  expect(description).toHaveProperty("textContent", "Review")
  await waitFor(() => expect(stored()[0].endedAt).not.toBeNull())
  expect(screen.getByRole("button", { name: "Start timer" })).toBeTruthy()
})

test("the timer page has no history button; the History tab is the way there", async () => {
  await setup()
  expect(await screen.findByRole("heading", { name: "Recent" })).toBeTruthy()
  expect(screen.queryByRole("link", { name: /history/i })).toBeNull()
  expect(screen.queryByRole("button", { name: /history/i })).toBeNull()
})

// The times in a row: buttons that turn into a time input in place.
const startOf = (name: string) => screen.getByRole("button", { name: new RegExp(`^Change start time of ${name} at`) })
const endOf = (name: string) => screen.getByRole("button", { name: new RegExp(`^Change end time of ${name} at`) })
const timeEditor = () => screen.getByRole("group", { name: /time of / })
const segment = (unit: string) => within(timeEditor()).getByRole("spinbutton", { name: unit })
const byId = (list: Entry[], id: string) => list.find((entry) => entry.id === id)!

test("pressing a row's start time edits it in place, and Enter saves it on the same day", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(startOf("Invoices"))
  // No dialog: the time itself became the input, with focus on its hour.
  expect(screen.queryByRole("dialog")).toBeNull()
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))

  await user.keyboard("{ArrowDown}{Enter}")
  await waitFor(() => expect(byId(stored(), "e2").startedAt).toBe(at(10, 13)))
  // The end didn't move, and the seconds of the edited time are gone, as the input shows minutes.
  expect(byId(stored(), "e2").endedAt).toBe(at(10, 14, 30, 20))
  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  // Focus goes back to the time, now showing the new value, and the duration follows.
  await waitFor(() => expect(document.activeElement).toBe(startOf("Invoices")))
  expect(startOf("Invoices").closest("li")?.textContent).toContain("1h 30m")
})

test("the end time saves when the input loses focus", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(endOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}")
  await user.click(document.body)

  await waitFor(() => expect(byId(stored(), "e3").endedAt).toBe(at(12, 11)))
  expect(byId(stored(), "e3").startedAt).toBe(at(12, 9))
})

test("Escape puts the time back without saving", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}{Escape}")

  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  expect(stored()).toEqual(before)
  await waitFor(() => expect(document.activeElement).toBe(startOf("Planning")))
})

test("an end before the start isn't saved: the input stays open, marked invalid", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(endOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  // 10:00 back two hours is 08:00, before the 09:00 start.
  await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")

  expect(timeEditor().getAttribute("aria-invalid")).toBe("true")
  expect(stored()).toEqual(before)
  // Leaving it now drops the bad time instead of saving it.
  await user.click(document.body)
  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  expect(stored()).toEqual(before)
})

test("the running row's times aren't editable", async () => {
  await setupHistory({ labels: [work], entries: [runningSince(10)] })

  expect(screen.getByText("Live work")).toBeTruthy()
  expect(screen.queryByRole("button", { name: /^Change (start|end) time of Live work/ })).toBeNull()
})

// Tab from the start time's last part goes straight into editing the end.
const parts = () => within(timeEditor()).getAllByRole("spinbutton")
// Tabs from the input's first part out past its last. The count is read first: the input can
// close on the last Tab.
async function tabOutOfStart(user: ReturnType<typeof userEvent.setup>) {
  const count = parts().length
  for (let i = 0; i < count; i++) await user.keyboard("{Tab}")
}

test("Tab from the start goes straight into editing the end, saving nothing yet", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}")
  await tabOutOfStart(user)

  // The end is the input now, focused on its hour; the start shows what was typed, unsaved.
  expect(timeEditor().getAttribute("aria-label")).toMatch(/^End time of Planning/)
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  expect(startOf("Planning").textContent).toMatch(/^10:00/)
  expect(stored()).toEqual(before)
})

test("start and end Tabbed through together save as one, so an entry can move past its old end", async () => {
  const { user, entries: stored } = await setupHistory()

  // Planning, 9:00 AM–10:00 AM, becomes 11:00 AM–10:00 PM: the new start is after the old end,
  // which alone would be refused. The tests run on a 12-hour clock, so the end changes by its PM.
  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}{ArrowUp}")
  await tabOutOfStart(user)
  expect(timeEditor().getAttribute("aria-invalid")).toBeNull()
  segment("AM/PM").focus()
  await user.keyboard("{ArrowUp}{Enter}")

  await waitFor(() =>
    expect(byId(stored(), "e3")).toMatchObject({ startedAt: at(12, 11), endedAt: at(12, 22) })
  )
  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  await waitFor(() => expect(document.activeElement).toBe(endOf("Planning")))
})

test("Escape on the end after Tabbing from the start puts both times back", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}")
  await tabOutOfStart(user)
  await user.keyboard("{ArrowUp}{Escape}")

  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  expect(stored()).toEqual(before)
  expect(startOf("Planning").textContent).toBe(endOf("Planning").textContent?.replace(/10/, "09"))
})

test("Shift+Tab from the end goes back into the start, still one unsaved edit", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}{ArrowUp}")
  await tabOutOfStart(user)
  await user.keyboard("{Shift>}{Tab}{/Shift}")

  // Back on the start's last part, with what was typed in it kept.
  expect(timeEditor().getAttribute("aria-label")).toMatch(/^Start time of Planning/)
  const all = parts()
  await waitFor(() => expect(document.activeElement).toBe(all[all.length - 1]))
  expect(segment("hour").getAttribute("aria-valuenow")).toBe("11")
  expect(stored()).toEqual(before)
})

test("an end before a Tabbed-in start stays open and saves neither", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  // Start 11:00, end left at 10:00.
  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}{ArrowUp}")
  await tabOutOfStart(user)
  await user.keyboard("{Enter}")
  expect(timeEditor().getAttribute("aria-invalid")).toBe("true")

  // Tab out is refused too, and clicking away drops the whole edit.
  await tabOutOfStart(user)
  expect(timeEditor().getAttribute("aria-label")).toMatch(/^End time of Planning/)
  await user.click(document.body)
  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  expect(stored()).toEqual(before)
})

test("Tab out of the end saves both and moves on to the next control as usual", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}")
  await tabOutOfStart(user)
  await user.keyboard("{ArrowUp}")
  await tabOutOfStart(user)

  await waitFor(() =>
    expect(byId(stored(), "e3")).toMatchObject({ startedAt: at(12, 10), endedAt: at(12, 11) })
  )
  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  // Focus left the times: it didn't chain into another time input.
  expect(document.activeElement?.closest(".entry-times")).toBeNull()
})

test("pressing the end directly edits it alone, as before", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(endOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}{Shift>}{Tab}{/Shift}")

  // Shift+Tab from an end that wasn't reached from the start leaves the times and saves the end.
  await waitFor(() => expect(byId(stored(), "e3").endedAt).toBe(at(12, 11)))
  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
})

// Phones have no Tab: pressing the other time while one is open links them the same way.
test("pressing the end while the start is open edits it without saving the start", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}{ArrowUp}")
  await user.click(endOf("Planning"))

  expect(timeEditor().getAttribute("aria-label")).toMatch(/^End time of Planning/)
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  // The start shows 11:00, after the 10:00 end, and isn't saved or refused yet.
  expect(startOf("Planning").textContent).toMatch(/^11:00/)
  expect(timeEditor().getAttribute("aria-invalid")).toBeNull()
  expect(stored()).toEqual(before)

  // Moving the end to 10 PM makes the pair valid, and Enter saves both at once.
  segment("AM/PM").focus()
  await user.keyboard("{ArrowUp}{Enter}")
  await waitFor(() =>
    expect(byId(stored(), "e3")).toMatchObject({ startedAt: at(12, 11), endedAt: at(12, 22) })
  )
})

test("pressing back on the start keeps the edit going, and Escape then puts both back", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}")
  await user.click(endOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowUp}")
  await user.click(startOf("Planning"))

  expect(timeEditor().getAttribute("aria-label")).toMatch(/^Start time of Planning/)
  expect(segment("hour").getAttribute("aria-valuenow")).toBe("10")
  expect(endOf("Planning").textContent).toMatch(/^11:00/)
  expect(stored()).toEqual(before)

  await user.keyboard("{Escape}")
  expect(screen.queryByRole("group", { name: /time of / })).toBeNull()
  expect(stored()).toEqual(before)
})

test("pressing anywhere else still saves the open time", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(startOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(segment("hour")))
  await user.keyboard("{ArrowDown}")
  // Another entry's time is elsewhere too: it saves this one, then opens that one alone.
  await user.click(startOf("Invoices"))

  await waitFor(() => expect(byId(stored(), "e3").startedAt).toBe(at(12, 8)))
  expect(timeEditor().getAttribute("aria-label")).toMatch(/^Start time of Invoices/)
})

// The description in a row: a button that turns into a text field in place.
const descriptionOf = (name: string) =>
  screen.getByRole("button", { name: new RegExp(`^Change description of ${name} at`) })
const descriptionField = () => screen.getByRole("textbox", { name: /^Description of / })

test("pressing a row's description edits it in place, and Enter saves it", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(descriptionOf("Invoices"))
  expect(screen.queryByRole("dialog")).toBeNull()
  const field = descriptionField()
  await waitFor(() => expect(document.activeElement).toBe(field))
  expect(field).toHaveProperty("textContent", "Invoices")
  // The caret is at the end, ready to add to it: what's typed goes after the text.
  await user.keyboard(" for October")
  expect(field).toHaveProperty("textContent", "Invoices for October")
  await user.keyboard("{Enter}")
  await waitFor(() => expect(byId(stored(), "e2").description).toBe("Invoices for October"))
  // Only the description changed; it has no labels in it, so the entry has none.
  expect(byId(stored(), "e2")).toMatchObject({ labelIds: [], startedAt: at(10, 14, 0, 20) })
  expect(screen.queryByRole("textbox", { name: /^Description of / })).toBeNull()
  await waitFor(() => expect(document.activeElement).toBe(descriptionOf("Invoices for October")))
})

test("the description saves when it loses focus, trimmed", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(descriptionOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await user.clear(descriptionField())
  await user.type(descriptionField(), "  Roadmap  ")
  await user.click(document.body)

  await waitFor(() => expect(byId(stored(), "e3").description).toBe("Roadmap"))
})

test("Escape puts the description back without saving", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(descriptionOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await user.keyboard("{Backspace}{Backspace}{Escape}")

  expect(screen.queryByRole("textbox", { name: /^Description of / })).toBeNull()
  expect(stored()).toEqual(before)
  await waitFor(() => expect(document.activeElement).toBe(descriptionOf("Planning")))
})

test("a description can be cleared, and an empty one edited from its placeholder", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(descriptionOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await user.clear(descriptionField())
  await user.keyboard("{Enter}")
  await waitFor(() => expect(byId(stored(), "e3").description).toBe(""))

  // e3 and e4 have no description now: both show the placeholder, and either can be filled in.
  const empty = screen.getAllByRole("button", { name: /^Change description of entry at/ })
  expect(empty.map((button) => button.textContent)).toEqual(["No description", "No description"])
  const untitled = empty.find((button) => button.closest('[data-entry-id="e4"]'))
  await user.click(untitled!)
  await waitFor(() => expect(descriptionField()).toHaveProperty("textContent", ""))
  await user.keyboard("Filed{Enter}")
  await waitFor(() => expect(byId(stored(), "e4").description).toBe("Filed"))
})

test("an unchanged description isn't saved again", async () => {
  const { user, entries: stored, api } = await setupHistory()
  const before = stored()
  const save = vi.spyOn(api, "saveEntry")

  await user.click(descriptionOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await user.keyboard("{Enter}")

  expect(save).not.toHaveBeenCalled()
  expect(stored()).toEqual(before)
})

test("the running row's description isn't editable in the list", async () => {
  await setupHistory({ labels: [work], entries: [runningSince(10)] })

  expect(screen.getByText("Live work")).toBeTruthy()
  expect(screen.queryByRole("button", { name: /^Change description of Live work/ })).toBeNull()
})

// Labels live in the description: # opens a menu, and the chosen label is saved in the text.
test("# in the timer's description opens the labels, and picking one saves it in the text", async () => {
  const { user, entries: stored } = await setup({ labels: [work, admin], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await waitFor(() => expect(document.activeElement).toBe(timerDescription()))

  await user.keyboard("working on #")
  await expectOptions(["Admin", "Work"])
  await user.keyboard("wo")
  await expectOptions(["Work", "Create “wo”"])
  await user.keyboard("{Enter} today")

  await waitFor(() =>
    expect(stored()[0]).toMatchObject({
      description: "working on #<label:work> today",
      labelIds: ["work"],
      endedAt: null,
    })
  )
  // The label is a chip in the text: the description reads with its name.
  expect(timerDescription().textContent).toContain("Work")
  expect(timerDescription().textContent).not.toContain("#<label:")
})

test("a name no label has can be created from the menu, and goes in the text", async () => {
  const { user, entries: stored, labels } = await setup({ labels: [work], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await waitFor(() => expect(document.activeElement).toBe(timerDescription()))

  await user.keyboard("#backend")
  await expectOptions(["Create “backend”"])
  await user.keyboard("{Enter}")

  const created = labels().find((label) => label.name === "backend")
  expect(created?.color).toMatch(/^#[0-9a-f]{6}$/)
  await waitFor(() =>
    expect(stored()[0]).toMatchObject({
      description: `#<label:${created?.id}>`,
      labelIds: [created?.id],
    })
  )
})

test("an exact name, in any case, offers no Create", async () => {
  const { user, labels } = await setup({ labels: [work], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await waitFor(() => expect(document.activeElement).toBe(timerDescription()))

  await user.keyboard("#work")
  await expectOptions(["Work"])
  await user.keyboard("{Enter}")
  expect(labels()).toEqual([work])
})

test("#text typed without picking from the menu stays text, like a PR number", async () => {
  const { user, entries: stored, labels } = await setup({ labels: [work], entries: [] })
  await user.click(screen.getByRole("button", { name: "Start timer" }))
  await waitFor(() => expect(document.activeElement).toBe(timerDescription()))

  // A space, or Escape, leaves the menu without choosing.
  await user.keyboard("review PR #12 ")
  await user.keyboard("and #work{Escape} done")
  await user.click(document.body)

  await waitFor(() =>
    expect(stored()[0]).toMatchObject({ description: "review PR #12 and #work done", labelIds: [] })
  )
  expect(labels()).toEqual([work])
})

test("a label's place in the text is kept, and shows as a chip in the list", async () => {
  const labelled: Entry = {
    id: "l1",
    description: "working on #<label:work> with #<label:admin> today",
    labelIds: ["work", "admin"],
    startedAt: at(10, 9),
    endedAt: at(10, 10),
  }
  await setupHistory({ labels: [work, admin], entries: [labelled] })

  const description = descriptionOf("working on #Work with #Admin today")
  expect(description.textContent).toBe("working on Work with Admin today")
  expect([...description.querySelectorAll(".desc-chip")].map((chip) => chip.textContent)).toEqual([
    "Work",
    "Admin",
  ])
  // No separate list of labels under the description.
  expect(description.closest("[data-entry-id]")?.textContent?.match(/Work/g)).toHaveLength(1)
})

test("removing a label's chip in a row removes the label from the entry", async () => {
  const labelled: Entry = {
    id: "l1",
    description: "planning #<label:work>",
    labelIds: ["work"],
    startedAt: at(10, 9),
    endedAt: at(10, 10),
  }
  const { user, entries: stored } = await setupHistory({ labels: [work, admin], entries: [labelled] })

  await user.click(descriptionOf("planning #Work"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await user.keyboard("{Backspace}{Enter}")

  await waitFor(() => expect(byId(stored(), "l1")).toMatchObject({ description: "planning", labelIds: [] }))
})

test("labels can be added while editing a row, at the caret", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(descriptionOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await pickLabel(user, " #ad", "Admin")
  // Choosing from the menu keeps the edit going: it isn't a click away.
  expect(descriptionField()).toBeTruthy()
  await user.keyboard("{Enter}")

  await waitFor(() =>
    expect(byId(stored(), "e3")).toMatchObject({
      description: "Planning #<label:admin>",
      labelIds: ["admin"],
    })
  )
})

test("Escape with the label menu open only closes the menu", async () => {
  const { user, entries: stored } = await setupHistory()
  const before = stored()

  await user.click(descriptionOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await user.keyboard(" #ad")
  await expectOptions(["Admin", "Create “ad”"])
  await user.keyboard("{Escape}")

  expect(screen.queryByRole("option")).toBeNull()
  expect(descriptionField()).toBeTruthy()
  await user.keyboard("{Escape}")
  expect(screen.queryByRole("textbox", { name: /^Description of / })).toBeNull()
  expect(stored()).toEqual(before)
})

test("a label that no longer exists shows as unknown, not as its id", async () => {
  const orphan: Entry = {
    id: "o1",
    description: "old #<label:gone>",
    labelIds: [],
    startedAt: at(10, 9),
    endedAt: at(10, 10),
  }
  await setupHistory({ labels: [work], entries: [orphan] })

  const description = descriptionOf("old #unknown label")
  expect(description.textContent).toBe("old unknown label")
  expect(description.querySelector(".desc-chip")?.hasAttribute("data-unknown")).toBe(true)
})

test("a long description wraps instead of being cut off", async () => {
  const long = "Review the quarterly numbers with finance, then write up the notes for the board meeting"
  await setupHistory({
    labels: [],
    entries: [{ id: "w1", description: long, labelIds: [], startedAt: at(10, 9), endedAt: at(10, 10) }],
  })
  const description = screen.getByRole("button", { name: /^Change description of Review the quarterly/ })
  expect(description.textContent).toBe(long)
  expect(description.className).not.toMatch(/truncate/)
})

// Delete is the trash at the end of a row, with Undo instead of a confirmation.
test("the trash deletes an entry at once, and Undo puts it back as it was", async () => {
  const { user, entries: stored } = await setupHistory()

  await deleteRow(user, "Invoices")
  await waitFor(() => expect(stored().map((entry) => entry.id)).toEqual(["e1", "e3", "e4"]))
  expect(screen.queryByText("Invoices")).toBeNull()
  expect(summary().getByText("3 entries")).toBeTruthy()

  await waitFor(() => expect(screen.getAllByText("Deleted “Invoices”").length).toBeGreaterThan(0))
  // The toast region lists each toast once on screen and once for screen readers: either works.
  await user.click(screen.getAllByRole("button", { name: "Undo" })[0])

  await waitFor(() => expect(byId(stored(), "e2")).toEqual(entries[1]))
  expect(await screen.findByText("Invoices")).toBeTruthy()
  expect(summary().getByText("4 entries")).toBeTruthy()
})

test("the running row has no trash", async () => {
  await setupHistory({ labels: [work], entries: [runningSince(10)] })
  expect(screen.getByText("Live work")).toBeTruthy()
  expect(screen.queryByRole("button", { name: /^Delete / })).toBeNull()
})

test("rows don't open a dialog: there's no edit button, only the times, description and trash", async () => {
  const { user } = await setupHistory()

  expect(screen.queryByRole("button", { name: /^Edit / })).toBeNull()
  const row = startOf("Planning").closest("[data-entry-id]") as HTMLElement
  expect(within(row).getAllByRole("button").map((button) => button.getAttribute("aria-label")?.split(" of ")[0])).toEqual([
    "Change start time",
    "Change end time",
    "Change description",
    "Delete Planning at 9:00 AM, Thursday, November 12, 2026".split(" of ")[0],
  ])
  await user.click(within(row).getByText("1h 00m"))
  expect(screen.queryByRole("dialog")).toBeNull()
})

// The dialog only adds entries now.
test("the add dialog takes labels in its description, and checks the times", async () => {
  // Mid-morning, so two hours back from the end stays before the start: at 1 PM, on a 12-hour
  // clock, the hour goes 1, 12, 11 and stays PM, which is after the start.
  vi.useFakeTimers({ shouldAdvanceTime: true, toFake: ["Date"] })
  const morning = new Date()
  morning.setHours(10, 0, 0, 0)
  vi.setSystemTime(morning)
  try {
    const { user, entries: stored } = await setupHistory({ labels: [work], entries: [] })

    await user.click(screen.getByRole("button", { name: "Add entry" }))
    const dialog = within(await screen.findByRole("dialog", { name: "Add entry" }))
    expect(dialog.queryByRole("button", { name: "Delete" })).toBeNull()
    await user.click(dialog.getByRole("textbox", { name: "Entry description" }))
    await user.keyboard("Workshop ")
    await pickLabel(user, "#wo", "Work")

    // An end before the start is refused.
    const end = within(dialog.getByRole("group", { name: "Ended at" }))
    const start = within(dialog.getByRole("group", { name: "Started at" }))
    const startHour = start.getByRole("spinbutton", { name: /hour/i }).getAttribute("aria-valuenow")
    await user.click(end.getByRole("spinbutton", { name: /hour/i }))
    await user.keyboard(`{ArrowDown}{ArrowDown}`)
    await user.click(dialog.getByRole("button", { name: "Save entry" }))
    expect(await dialog.findByText("The end can't be before the start.")).toBeTruthy()
    expect(stored()).toEqual([])

    await user.click(end.getByRole("spinbutton", { name: /hour/i }))
    await user.keyboard(`{ArrowUp}{ArrowUp}`)
    await user.click(dialog.getByRole("button", { name: "Save entry" }))
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
    await waitFor(() =>
      expect(stored()[0]).toMatchObject({ description: "Workshop #<label:work>", labelIds: ["work"] })
    )
    expect(startHour).toBeTruthy()
  } finally {
    vi.useRealTimers()
  }
})

test("Cancel closes the add dialog without saving", async () => {
  const { user, entries: stored } = await setupHistory({ labels: [], entries: [] })

  await user.click(screen.getByRole("button", { name: "Add entry" }))
  const dialog = within(await screen.findByRole("dialog", { name: "Add entry" }))
  await user.click(dialog.getByRole("textbox", { name: "Entry description" }))
  await user.keyboard("Not this")
  await user.click(dialog.getByRole("button", { name: "Cancel" }))

  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull())
  expect(stored()).toEqual([])
})

test("an unknown label shows as unknown in the editor too, and stays as it was when saved", async () => {
  const orphan: Entry = {
    id: "o1",
    description: "old #<label:gone>",
    labelIds: [],
    startedAt: at(10, 9),
    endedAt: at(10, 10),
  }
  const { user, entries: stored } = await setupHistory({ labels: [work], entries: [orphan] })

  await user.click(descriptionOf("old #unknown label"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  expect(descriptionField().textContent).toContain("unknown label")
  expect(descriptionField().textContent).not.toContain("gone")
  await user.keyboard(" more{Enter}")

  await waitFor(() => expect(byId(stored(), "o1").description).toBe("old #<label:gone> more"))
})

test("a label used twice in a description is on the entry once", async () => {
  const { user, entries: stored } = await setupHistory()

  await user.click(descriptionOf("Planning"))
  await waitFor(() => expect(document.activeElement).toBe(descriptionField()))
  await pickLabel(user, " #ad", "Admin")
  await pickLabel(user, " and #ad", "Admin")
  await user.keyboard("{Enter}")

  await waitFor(() =>
    expect(byId(stored(), "e3")).toMatchObject({
      description: "Planning #<label:admin> and #<label:admin>",
      labelIds: ["admin"],
    })
  )
})
