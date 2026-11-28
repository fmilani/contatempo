import { expect, test } from "vitest"
import {
  durationOf,
  formatClock,
  formatDuration,
  fromLocalInput,
  keepRecentDays,
  rangePresets,
  rangeToInstants,
  startOfDay,
  toLocalInput,
} from "@/lib/time"

test("formats durations", () => {
  expect(formatClock(3_723_000)).toBe("1:02:03")
  expect(formatClock(-5)).toBe("0:00:00")
  expect(formatDuration(45_000)).toBe("45s")
  expect(formatDuration(5 * 60_000)).toBe("5m")
  expect(formatDuration(3_723_000)).toBe("1h 02m")
})

test("a day range covers both local days in full", () => {
  const { from, to } = rangeToInstants(["2026-11-10", "2026-11-12"])
  expect(new Date(from)).toEqual(new Date(2026, 10, 10))
  expect(new Date(to)).toEqual(new Date(2026, 10, 13))
})

test("presets end today and start the week on Monday", () => {
  const presets = Object.fromEntries(
    rangePresets(new Date(2026, 10, 18, 9)).map((preset) => [preset.label, preset.value])
  )
  expect(presets).toEqual({
    Today: ["2026-11-18", "2026-11-18"],
    "This week": ["2026-11-16", "2026-11-18"],
    "Last 7 days": ["2026-11-12", "2026-11-18"],
    "This month": ["2026-11-01", "2026-11-18"],
  })
})

test("presets that cover the same days are offered once", () => {
  const sunday = rangePresets(new Date(2026, 10, 15, 9)).map((preset) => preset.label)
  expect(sunday).toEqual(["Today", "This week", "This month"])
  const firstOfMonth = rangePresets(new Date(2026, 11, 1, 9)).map((preset) => preset.label)
  expect(firstOfMonth).toEqual(["Today", "This week", "Last 7 days"])
})

test("local input values round-trip through UTC instants", () => {
  const iso = new Date(2026, 10, 15, 14, 30).toISOString()
  expect(toLocalInput(iso)).toBe("2026-11-15T14:30")
  expect(fromLocalInput("2026-11-15T14:30")).toBe(iso)
})

test("a running entry lasts until now", () => {
  const startedAt = "2026-11-15T10:00:00.000Z"
  expect(durationOf({ startedAt, endedAt: null }, Date.parse(startedAt) + 90_000)).toBe(90_000)
  expect(durationOf({ startedAt, endedAt: "2026-11-15T11:00:00.000Z" })).toBe(3_600_000)
})

test("finds the start of an instant's local day", () => {
  expect(startOfDay(new Date(2026, 10, 5, 23, 59).toISOString())).toBe(new Date(2026, 10, 5).toISOString())
  expect(startOfDay(new Date(2026, 10, 5).toISOString())).toBe(new Date(2026, 10, 5).toISOString())
})

test("keeps the entries of the first days in a newest-first list, whatever the gaps", () => {
  const on = (day: number, hour: number) => ({ startedAt: new Date(2026, 10, day, hour).toISOString(), id: `${day}-${hour}` })
  const list = [on(20, 9), on(20, 8), on(12, 23), on(12, 0), on(1, 10)]
  expect(keepRecentDays(list, 2).map((entry) => entry.id)).toEqual(["20-9", "20-8", "12-23", "12-0"])
  expect(keepRecentDays(list, 1).map((entry) => entry.id)).toEqual(["20-9", "20-8"])
  expect(keepRecentDays([], 2)).toEqual([])
})
