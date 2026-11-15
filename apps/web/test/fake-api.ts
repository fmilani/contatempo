import type { Api, Entry, Label } from "@/lib/api"

export function createFakeApi(seed: { labels?: Label[]; entries?: Entry[] } = {}) {
  let labels = [...(seed.labels ?? [])]
  let entries = [...(seed.entries ?? [])]
  let nextId = 1
  const id = (prefix: string) => `${prefix}-${nextId++}`

  const api: Api = {
    listLabels: async () => [...labels].sort((a, b) => a.name.localeCompare(b.name)),
    createLabel: async (name, color) => {
      const label = { id: id("label"), name, color }
      labels = [...labels, label]
      return label
    },
    getRunning: async () => entries.find((entry) => entry.endedAt === null) ?? null,
    listEntries: async ({ from, to, labelIds }) =>
      entries
        .filter((entry) => entry.endedAt !== null)
        .filter((entry) => !from || entry.startedAt >= from)
        .filter((entry) => !to || entry.startedAt < to)
        .filter((entry) => labelIds.length === 0 || entry.labelIds.some((l) => labelIds.includes(l)))
        .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    startTimer: async (description, labelIds) => {
      const now = new Date().toISOString()
      entries = entries.map((entry) => (entry.endedAt === null ? { ...entry, endedAt: now } : entry))
      entries = [...entries, { id: id("entry"), description, labelIds, startedAt: now, endedAt: null }]
    },
    stopTimer: async () => {
      const now = new Date().toISOString()
      entries = entries.map((entry) => (entry.endedAt === null ? { ...entry, endedAt: now } : entry))
    },
    saveEntry: async (input) => {
      const entry = { ...input, id: input.id ?? id("entry") }
      entries = [...entries.filter((other) => other.id !== entry.id), entry]
    },
    deleteEntry: async (entryId) => {
      entries = entries.filter((entry) => entry.id !== entryId)
    },
  }

  return { api, entries: () => entries, labels: () => labels }
}
