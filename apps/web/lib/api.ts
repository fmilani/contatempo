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

export type EntryInput = Omit<Entry, "id"> & { id?: string }

// `from` is inclusive and `to` exclusive, as instants. An entry matches when it has any of `labelIds`.
export type EntryFilter = { from?: string; to?: string; labelIds: string[] }

export type Api = {
  listLabels(): Promise<Label[]>
  createLabel(name: string, color: string): Promise<Label>
  getRunning(): Promise<Entry | null>
  listEntries(filter: EntryFilter): Promise<Entry[]>
  startTimer(description: string, labelIds: string[]): Promise<void>
  stopTimer(): Promise<void>
  saveEntry(entry: EntryInput): Promise<void>
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

function check<T>({ data, error }: { data: T; error: { message: string } | null }) {
  if (error) throw new Error(error.message)
  return data
}

export function createApi(supabase: SupabaseClient<Database>): Api {
  return {
    async listLabels() {
      return check(await supabase.from("labels").select("id, name, color").order("name")) ?? []
    },

    async createLabel(name, color) {
      const label = check(
        await supabase.from("labels").insert({ name, color }).select("id, name, color").single()
      )
      if (!label) throw new Error("The label wasn't created")
      return label
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

    async startTimer(description, labelIds) {
      check(await supabase.rpc("start_timer", { p_description: description, p_label_ids: labelIds }))
    },

    async stopTimer() {
      check(await supabase.rpc("stop_timer"))
    },

    async saveEntry(entry) {
      check(
        await supabase.rpc("save_entry", {
          p_id: entry.id,
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
