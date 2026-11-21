import { expect, test } from "vitest"
import { parseHistoryQuery, serializeHistoryQuery } from "@/lib/history-query"

const parse = (search: string) => parseHistoryQuery(new URLSearchParams(search))

test("a date range and several labels round-trip through the URL", () => {
  const query = { range: ["2026-11-01", "2026-11-21"] as [string, string], labelIds: ["a", "b"] }
  const search = serializeHistoryQuery(query)
  expect(search).toBe("from=2026-11-01&to=2026-11-21&label=a&label=b")
  expect(parse(search)).toEqual(query)
})

test("no filters is an empty query string", () => {
  expect(serializeHistoryQuery({ range: null, labelIds: [] })).toBe("")
  expect(parse("")).toEqual({ range: null, labelIds: [] })
})

test("a hand-edited URL with a broken range keeps the labels and drops the range", () => {
  expect(parse("from=2026-11-21&to=2026-11-01&label=a")).toEqual({ range: null, labelIds: ["a"] })
  expect(parse("from=yesterday&to=2026-11-01")).toEqual({ range: null, labelIds: [] })
  expect(parse("from=2026-11-01")).toEqual({ range: null, labelIds: [] })
  expect(parse("from=2026-02-30&to=2026-03-01").range).toBeNull()
})

test("repeated or empty labels are ignored", () => {
  expect(parse("label=a&label=a&label=").labelIds).toEqual(["a"])
})
