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
