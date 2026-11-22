"use client"

import { toast } from "@ui-sdk/react/toast"
import { useCallback, useEffect, useRef, useState } from "react"
import { LABEL_COLORS, matchesFilter, OfflineError, type Api, type Entry, type Label } from "@/lib/api"
import { rangeToInstants, type DayRange } from "@/lib/time"

type Data = { labels: Label[]; running: Entry | null; entries: Entry[] | null }

const messageOf = (cause: unknown) =>
  cause instanceof OfflineError
    ? "Couldn't reach the server, so your change was undone."
    : cause instanceof Error
      ? cause.message
      : "Something went wrong"

const byNewest = (a: Entry, b: Entry) =>
  Date.parse(b.startedAt) - Date.parse(a.startedAt) || a.id.localeCompare(b.id)

const byName = (a: Label, b: Label) => a.name.localeCompare(b.name)

// Every change shows at once and is sent in the background, one write at a time so they reach
// the server in the order they were made. A failed write shows a toast, and the data is read
// again once the writes settle, which undoes whatever the server refused.
export type TrackerQuery = { range: DayRange | null; labelIds: string[]; limit?: number }

const noLabels: string[] = []

function useTracker(api: Api, { range, labelIds = noLabels, limit }: TrackerQuery) {
  const [data, setData] = useState<Data>({ labels: [], running: null, entries: null })
  const dataRef = useRef(data)
  const queue = useRef(Promise.resolve())
  const pending = useRef(0)
  const writes = useRef(0)
  const reads = useRef(0)
  const stale = useRef(false)
  const failed = useRef(false)

  const { from, to } = range ? rangeToInstants(range) : { from: undefined, to: undefined }

  const commit = (next: Data) => {
    dataRef.current = next
    setData(next)
  }

  const load = useCallback(async () => {
    for (;;) {
      const read = ++reads.current
      const generation = writes.current
      try {
        const [labels, running, entries] = await Promise.all([
          api.listLabels(),
          api.getRunning(),
          api.listEntries({ from, to, labelIds, limit }),
        ])
        if (read !== reads.current) return
        // A read that crossed a write could undo it on screen: read again once the writes settle.
        if (pending.current > 0) {
          stale.current = true
          return
        }
        if (generation !== writes.current) continue
        commit({ labels, running, entries })
      } catch (cause) {
        if (read === reads.current) toast.error(messageOf(cause))
      }
      return
    }
  }, [api, from, to, labelIds, limit])

  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() only sets state after its requests resolve.
    void load()
    const onVisible = () => document.visibilityState === "visible" && void load()
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [load])

  // `reread` is for writes whose result the server decides, like a timer's start and end times.
  function mutate(apply: (data: Data) => Data, send: () => Promise<void>, reread = false) {
    writes.current += 1
    pending.current += 1
    if (reread) stale.current = true
    commit(apply(dataRef.current))
    queue.current = queue.current.then(async () => {
      try {
        await send()
      } catch (cause) {
        if (!failed.current) toast.error(messageOf(cause))
        failed.current = true
      }
      pending.current -= 1
      if (pending.current === 0 && (stale.current || failed.current)) {
        stale.current = false
        failed.current = false
        void loadRef.current()
      }
    })
  }

  const filter = { from, to, labelIds }
  const place = (entries: Entry[] | null, entry: Entry) => {
    if (!entries) return entries
    const rest = entries.filter((other) => other.id !== entry.id)
    return matchesFilter(entry, filter) ? [...rest, entry].sort(byNewest).slice(0, limit) : rest
  }
  const stopRunning = (current: Data, at: string): Data =>
    current.running
      ? { ...current, running: null, entries: place(current.entries, { ...current.running, endedAt: at }) }
      : current

  return {
    ...data,
    filter,

    start() {
      const now = new Date().toISOString()
      const id = crypto.randomUUID()
      mutate(
        (current) => ({
          ...stopRunning(current, now),
          running: { id, description: "", labelIds: [], startedAt: now, endedAt: null },
        }),
        () => api.startTimer(id, now),
        true
      )
    },

    stop() {
      const now = new Date().toISOString()
      mutate((current) => stopRunning(current, now), () => api.stopTimer(now), true)
    },

    setDetails(id: string, description: string, labelIds: string[]) {
      mutate(
        (current) => {
          const listed = current.entries?.find((entry) => entry.id === id)
          return {
            ...current,
            running:
              current.running?.id === id ? { ...current.running, description, labelIds } : current.running,
            entries: listed ? place(current.entries, { ...listed, description, labelIds }) : current.entries,
          }
        },
        () => api.setEntryDetails(id, description, labelIds)
      )
    },

    createLabel(name: string): Label {
      const { labels } = dataRef.current
      const existing = labels.find((label) => label.name.toLowerCase() === name.toLowerCase())
      if (existing) return existing
      const label = {
        id: crypto.randomUUID(),
        name,
        color: LABEL_COLORS[labels.length % LABEL_COLORS.length],
      }
      mutate(
        (current) => ({ ...current, labels: [...current.labels, label].sort(byName) }),
        () => api.createLabel(label)
      )
      return label
    },

    saveEntry(entry: Entry, create: boolean) {
      mutate(
        (current) =>
          entry.endedAt === null
            ? { ...current, running: entry }
            : { ...current, entries: place(current.entries, entry) },
        () => api.saveEntry(entry, create)
      )
    },

    deleteEntry(id: string) {
      mutate(
        (current) => ({
          ...current,
          entries: current.entries?.filter((entry) => entry.id !== id) ?? null,
        }),
        () => api.deleteEntry(id),
        // A shortened list reads again, so the next entry takes the deleted one's place.
        limit !== undefined
      )
    },
  }
}

export { useTracker }
