import { render, screen, within } from "@testing-library/react"
import { expect, test } from "vitest"
import { EntryList } from "@/components/entry-list"
import { Summary } from "@/components/summary"
import type { Entry, Label } from "@/lib/api"

// The totals end a running entry's time at the `now` they're given, not at the real clock, so they
// stay in step with the row and the timer, which tick from the same clock.
const work: Label = { id: "work", name: "Work", color: "#2563eb" }
const start = Date.parse("2026-11-22T09:00:00Z")
const running: Entry = { id: "r", description: "Live", labelIds: ["work"], startedAt: new Date(start).toISOString(), endedAt: null }

test("the summary totals end a running entry at the given time", () => {
  render(<Summary entries={[running]} labels={[work]} now={start + 25 * 60_000} />)
  const summary = within(screen.getByRole("region", { name: "Summary" }))
  expect(summary.getAllByText("25m")).toHaveLength(2)
})

test("the list row and its day subtotal end a running entry at the given time", () => {
  render(<EntryList entries={[running]} labels={[work]} onOpen={() => {}} now={start + 40 * 60_000} />)
  expect(screen.getAllByText("40m")).toHaveLength(2)
})

test("a day's name is its full date, read once, whatever form is shown", async () => {
  render(<EntryList entries={[running]} labels={[work]} onOpen={() => {}} now={start + 60_000} />)

  const full = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(new Date(start))
  // The day reads its full date, then how many entries it has.
  expect(await screen.findByRole("listitem", { name: new RegExp(`^${full}\\s*,\\s*1 entry$`) })).toBeTruthy()
  // The collapse button reads the same full date, without the short form shown on phones.
  expect(screen.getByRole("button", { name: full })).toBeTruthy()
})

test("each day shows how many entries it has", () => {
  const at = (id: string, hour: number, day = 22): Entry => ({
    id,
    description: id,
    labelIds: [],
    startedAt: `2026-11-${day}T${String(hour).padStart(2, "0")}:00:00Z`,
    endedAt: `2026-11-${day}T${String(hour).padStart(2, "0")}:30:00Z`,
  })
  render(
    <EntryList entries={[at("a", 9), at("b", 11), at("c", 13), at("d", 9, 20)]} labels={[]} onOpen={() => {}} />,
  )
  const counts = [...document.querySelectorAll(".day-count")].map((el) => el.textContent)
  expect(counts).toEqual([", 3 entries", ", 1 entry"])
})
