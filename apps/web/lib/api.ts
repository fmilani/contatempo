import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./supabase/database.types"

export type Label = { id: string; name: string; color: string }

export type Entry = {
  id: string
  description: string
  startedAt: string
  endedAt: string | null
  labelIds: string[]
}

// `from` is inclusive and `to` exclusive, as instants. An entry matches when it has any of `labelIds`.
export type EntryFilter = { from?: string; to?: string; labelIds: string[] }

// The same rule the server applies in listEntries, so a change can be placed in the list before it answers.
export function matchesFilter(entry: Entry, { from, to, labelIds }: EntryFilter) {
  const started = Date.parse(entry.startedAt)
  return (
    entry.endedAt !== null &&
    (!from || started >= Date.parse(from)) &&
    (!to || started < Date.parse(to)) &&
    (labelIds.length === 0 || entry.labelIds.some((id) => labelIds.includes(id)))
  )
}

// The app picks the ids of what it creates, so it can show new things before the server answers.
export type Api = {
  listLabels(): Promise<Label[]>
  createLabel(label: Label): Promise<void>
  getRunning(): Promise<Entry | null>
  listEntries(filter: EntryFilter): Promise<Entry[]>
  startTimer(id: string): Promise<void>
  stopTimer(): Promise<void>
  setEntryDetails(id: string, description: string, labelIds: string[]): Promise<void>
  saveEntry(entry: Entry, create: boolean): Promise<void>
  deleteEntry(id: string): Promise<void>
}

export const LABEL_COLORS = [
  "#2563eb",
  "#16a34a",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#db2777",
  "#65a30d",
]

const PAGE = 1000
const ENTRY = "id, description, started_at, ended_at, labels:time_entry_labels(label_id)"
const ENTRY_MATCHING = `${ENTRY}, matched:time_entry_labels!inner(label_id)` as const

type Row = {
  id: string
  description: string
  started_at: string
  ended_at: string | null
  labels: { label_id: string }[]
}

const toEntry = (row: Row): Entry => ({
  id: row.id,
  description: row.description,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  labelIds: row.labels.map((label) => label.label_id),
})

export class OfflineError extends Error {}

// supabase-js reports a request that never reached the server with an empty code.
function check<T>({ data, error }: { data: T; error: { message: string; code?: string } | null }) {
  if (error && !error.code) throw new OfflineError(error.message)
  if (error) throw new Error(error.message)
  return data
}

export function createApi(supabase: SupabaseClient<Database>): Api {
  return {
    async listLabels() {
      return check(await supabase.from("labels").select("id, name, color").order("name")) ?? []
    },

    async createLabel(label) {
      check(await supabase.from("labels").insert(label))
    },

    async getRunning() {
      const row = check(
        await supabase.from("time_entries").select(ENTRY).is("ended_at", null).maybeSingle()
      )
      return row ? toEntry(row) : null
    },

    async listEntries({ from, to, labelIds }) {
      const entries: Entry[] = []
      for (let offset = 0; ; offset += PAGE) {
        let query =
          labelIds.length > 0
            ? supabase.from("time_entries").select(ENTRY_MATCHING).in("matched.label_id", labelIds)
            : supabase.from("time_entries").select(ENTRY)
        query = query.not("ended_at", "is", null)
        if (from) query = query.gte("started_at", from)
        if (to) query = query.lt("started_at", to)
        const rows =
          check(
            await query
              .order("started_at", { ascending: false })
              .order("id")
              .range(offset, offset + PAGE - 1)
          ) ?? []
        entries.push(...rows.map(toEntry))
        if (rows.length < PAGE) return entries
      }
    },

    async startTimer(id) {
      check(await supabase.rpc("start_timer", { p_id: id, p_description: "", p_label_ids: [] }))
    },

    async stopTimer() {
      check(await supabase.rpc("stop_timer"))
    },

    async setEntryDetails(id, description, labelIds) {
      check(
        await supabase.rpc("set_entry_details", {
          p_id: id,
          p_description: description,
          p_label_ids: labelIds,
        })
      )
    },

    async saveEntry(entry, create) {
      check(
        await supabase.rpc("save_entry", {
          p_id: entry.id,
          p_create: create,
          p_description: entry.description,
          p_started_at: entry.startedAt,
          p_ended_at: entry.endedAt ?? undefined,
          p_label_ids: entry.labelIds,
        })
      )
    },

    async deleteEntry(id) {
      check(await supabase.from("time_entries").delete().eq("id", id))
    },
  }
}
