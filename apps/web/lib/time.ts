const pad = (value: number) => String(value).padStart(2, "0")

export function formatClock(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(seconds / 3600)}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`
}

export function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${pad(minutes)}m`
  if (minutes > 0) return `${minutes}m`
  return `${seconds}s`
}

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// The start of the local day an instant falls on, as an instant.
export function startOfDay(iso: string) {
  const date = new Date(iso)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

// The entries of the first `days` local days in a list ordered newest first.
export function keepRecentDays<T extends { startedAt: string }>(entries: T[], days: number) {
  const kept = new Set<string>()
  return entries.filter((entry) => {
    const key = dateKey(new Date(entry.startedAt))
    if (kept.size < days) kept.add(key)
    return kept.has(key)
  })
}

function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}

function addDays(key: string, days: number) {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + days)
  return dateKey(date)
}

export type DayRange = [from: string, to: string]

// Both days are inclusive and local; the instants are what the database compares.
export function rangeToInstants([from, to]: DayRange) {
  return {
    from: parseDateKey(from).toISOString(),
    to: parseDateKey(addDays(to, 1)).toISOString(),
  }
}

export function rangePresets(now: Date): { label: string; value: DayRange }[] {
  const today = dateKey(now)
  const weekStart = addDays(today, -((now.getDay() + 6) % 7))
  const monthStart = dateKey(new Date(now.getFullYear(), now.getMonth(), 1))
  const presets: { label: string; value: DayRange }[] = [
    { label: "Today", value: [today, today] },
    { label: "This week", value: [weekStart, today] },
    { label: "Last 7 days", value: [addDays(today, -6), today] },
    { label: "This month", value: [monthStart, today] },
  ]
  // Two presets can cover the same days, like "This week" and "Last 7 days" on a Sunday.
  return presets.filter(
    (preset, index) =>
      presets.findIndex((other) => other.value.join() === preset.value.join()) === index
  )
}

export function toLocalInput(iso: string) {
  const date = new Date(iso)
  return `${dateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromLocalInput(local: string) {
  return new Date(local).toISOString()
}

export function durationOf(entry: { startedAt: string; endedAt: string | null }, now = Date.now()) {
  const end = entry.endedAt ? Date.parse(entry.endedAt) : now
  return Math.max(0, end - Date.parse(entry.startedAt))
}
