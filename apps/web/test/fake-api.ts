import type { Api, Entry, Label } from "@/lib/api"

export function createFakeApi(seed: { labels?: Label[]; entries?: Entry[] } = {}) {
  let labels = [...(seed.labels ?? [])]
  let entries = [...(seed.entries ?? [])]
  let held: Promise<void> | null = null
  let readsHeld: Promise<void> | null = null
  let failNext: string | null = null
  let firstWriteDelay = 0

  const read = async <T,>(get: () => T) => {
    const value = get()
    await readsHeld
    return value
  }

  async function write(change: () => void) {
    await held
    const delay = firstWriteDelay
    firstWriteDelay = 0
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
    if (failNext) {
      const message = failNext
      failNext = null
      throw new Error(message)
    }
    change()
  }

  // Like the database's foreign key, an entry can only use labels that exist.
  const checkLabels = (ids: string[]) => {
    if (!ids.every((id) => labels.some((label) => label.id === id))) throw new Error("Unknown label")
  }

  const stopRunning = (now: string) => {
    entries = entries.map((entry) => (entry.endedAt === null ? { ...entry, endedAt: now } : entry))
  }

  const api: Api = {
    listLabels: () => read(() => [...labels].sort((a, b) => a.name.localeCompare(b.name))),
    createLabel: (label) =>
      write(() => {
        labels = [...labels, label]
      }),
    getRunning: () => read(() => entries.find((entry) => entry.endedAt === null) ?? null),
    listEntries: ({ from, to, labelIds }) =>
      read(() =>
      entries
        .filter((entry) => entry.endedAt !== null)
        .filter((entry) => !from || entry.startedAt >= from)
        .filter((entry) => !to || entry.startedAt < to)
        .filter((entry) => labelIds.length === 0 || entry.labelIds.some((l) => labelIds.includes(l)))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      ),
    startTimer: (id, at) =>
      write(() => {
        stopRunning(at)
        entries = [...entries, { id, description: "", labelIds: [], startedAt: at, endedAt: null }]
      }),
    stopTimer: (at) => write(() => stopRunning(at)),
    setEntryDetails: (id, description, labelIds) =>
      write(() => {
        if (!entries.some((entry) => entry.id === id)) throw new Error("Entry not found")
        checkLabels(labelIds)
        entries = entries.map((entry) => (entry.id === id ? { ...entry, description, labelIds } : entry))
      }),
    saveEntry: (entry, create) =>
      write(() => {
        if (create === entries.some((other) => other.id === entry.id)) {
          throw new Error(create ? "Entry already exists" : "Entry not found")
        }
        checkLabels(entry.labelIds)
        entries = [...entries.filter((other) => other.id !== entry.id), entry]
      }),
    deleteEntry: (entryId) =>
      write(() => {
        entries = entries.filter((entry) => entry.id !== entryId)
      }),
  }

  return {
    api,
    entries: () => entries,
    labels: () => labels,
    // Holds every write until the returned function is called, like a slow network.
    hold() {
      let release = () => {}
      held = new Promise<void>((resolve) => (release = resolve))
      return () => {
        held = null
        release()
      }
    },
    failNextWrite(message: string) {
      failNext = message
    },
    // The next write takes longer than the ones after it, like a slow request.
    slowNextWrite(ms = 30) {
      firstWriteDelay = ms
    },
    // Reads take their snapshot now but answer only when released, like a slow refresh.
    holdReads() {
      let release = () => {}
      readsHeld = new Promise<void>((resolve) => (release = resolve))
      return () => {
        readsHeld = null
        release()
      }
    },
  }
}
