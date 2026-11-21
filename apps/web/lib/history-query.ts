import type { DayRange } from "./time"

// The history filters as they appear in the URL: ?from=2026-11-01&to=2026-11-21&label=<id>&label=<id>
export type HistoryQuery = { range: DayRange | null; labelIds: string[] }

export const emptyHistoryQuery: HistoryQuery = { range: null, labelIds: [] }

// Date.parse accepts 2026-02-30 and rolls it into March, so the day must read back unchanged.
const isDay = (value: string | null): value is string =>
  value !== null &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  new Date(`${value}T00:00:00Z`).toISOString().startsWith(value)

export function parseHistoryQuery(params: URLSearchParams): HistoryQuery {
  const from = params.get("from")
  const to = params.get("to")
  return {
    range: isDay(from) && isDay(to) && from <= to ? [from, to] : null,
    labelIds: [...new Set(params.getAll("label").filter(Boolean))],
  }
}

export function serializeHistoryQuery({ range, labelIds }: HistoryQuery) {
  const params = new URLSearchParams()
  if (range) {
    params.set("from", range[0])
    params.set("to", range[1])
  }
  for (const id of labelIds) params.append("label", id)
  return params.toString()
}
