"use client"

import { Button } from "@ui-sdk/react/button"
import { useState } from "react"
import { toast } from "@ui-sdk/react/toast"
import { inFilter, type Api, type Entry } from "@/lib/api"
import { readableDescription } from "@/lib/description"
import type { HistoryQuery } from "@/lib/history-query"
import { EntryDialog, type EntryInput } from "./entry-dialog"
import { CollapseAllToggle, EntryList, useDayCollapse } from "./entry-list"
import { Filters } from "./filters"
import { Summary } from "./summary"
import { TimerBar } from "./timer-bar"
import { useNow } from "./use-now"
import { useTracker } from "./use-tracker"

export const RECENT_LIMIT = 10

type Tracker = ReturnType<typeof useTracker>

// What the pages that list entries share: editing a row, deleting one with an Undo toast, and
// the dialog that adds a past entry by hand.
function useEntryEditing(tracker: Tracker) {
  const [adding, setAdding] = useState<EntryInput | null>(null)
  const byId = new Map(tracker.labels.map((label) => [label.id, label]))

  function addEntry() {
    const end = new Date()
    end.setSeconds(0, 0)
    setAdding({
      description: "",
      labelIds: [],
      startedAt: new Date(end.getTime() - 60 * 60 * 1000).toISOString(),
      endedAt: end.toISOString(),
    })
  }

  // Deletes at once, and Undo puts it back as it was, with the same id.
  function deleteEntry(entry: Entry) {
    tracker.deleteEntry(entry.id)
    const name = readableDescription(entry.description, byId).trim()
    toast(name ? `Deleted “${name}”` : "Deleted entry", {
      action: { label: "Undo", onAction: () => tracker.saveEntry(entry, true) },
    })
  }

  const listProps = {
    onSave: (entry: Entry) => tracker.saveEntry(entry, false),
    onDelete: deleteEntry,
    onCreateLabel: tracker.createLabel,
  }

  const dialogs = (
    <EntryDialog
      entry={adding}
      labels={tracker.labels}
      onClose={() => setAdding(null)}
      onSave={(draft) => tracker.saveEntry({ ...draft, id: crypto.randomUUID() }, true)}
      onCreateLabel={tracker.createLabel}
    />
  )

  return { addEntry, listProps, dialogs }
}

const loading = (
  <p role="status" className="text-(--ui-muted-foreground)">
    Loading entries…
  </p>
)

const recentQuery = { range: null, labelIds: [], limit: RECENT_LIMIT }

function TimerView({ api }: { api: Api }) {
  const tracker = useTracker(api, recentQuery)
  const editing = useEntryEditing(tracker)
  const { labels, running } = tracker
  // The running timer heads the list. The list keeps its length, so on Stop its row simply
  // becomes a finished one instead of the list growing a row.
  const entries =
    tracker.entries && running
      ? [running, ...tracker.entries].slice(0, RECENT_LIMIT)
      : tracker.entries
  const now = useNow(running !== null)
  const collapse = useDayCollapse(entries)

  return (
    <>
      <TimerBar
        loaded={tracker.entries !== null}
        running={running}
        labels={labels}
        onStart={tracker.start}
        onStop={tracker.stop}
        onUpdate={tracker.setDetails}
        onCreateLabel={tracker.createLabel}
      />
      <section aria-labelledby="recent-heading" className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 id="recent-heading" className="text-lg font-semibold">
            Recent
          </h1>
          {entries?.length ? <CollapseAllToggle collapse={collapse} /> : null}
        </div>
        {entries === null ? (
          loading
        ) : entries.length > 0 ? (
          <EntryList
            entries={entries}
            labels={labels}
            {...editing.listProps}
            now={now}
            collapse={collapse}
          />
        ) : (
          <p className="text-(--ui-muted-foreground)">Nothing tracked yet. Press start to begin.</p>
        )}
      </section>
      {editing.dialogs}
    </>
  )
}

type HistoryViewProps = {
  api: Api
  query: HistoryQuery
  onQueryChange: (query: HistoryQuery) => void
}

function HistoryView({ api, query, onQueryChange }: HistoryViewProps) {
  const tracker = useTracker(api, query)
  const editing = useEntryEditing(tracker)
  const { labels, running, filter } = tracker
  const filtered = query.range !== null || query.labelIds.length > 0
  // The running timer joins the list when it matches the filters, and its time keeps counting.
  const live = running && inFilter(running, filter) ? running : null
  const entries = tracker.entries && live ? [live, ...tracker.entries] : tracker.entries
  const now = useNow(live !== null)
  const collapse = useDayCollapse(entries)

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">History</h1>
        <div className="flex items-center gap-2">
          {entries?.length ? <CollapseAllToggle collapse={collapse} /> : null}
          <Button onClick={editing.addEntry}>Add entry</Button>
        </div>
      </div>
      <Filters
        labels={labels}
        range={query.range}
        labelIds={query.labelIds}
        onRangeChange={(range) => onQueryChange({ ...query, range })}
        onLabelIdsChange={(labelIds) => onQueryChange({ ...query, labelIds })}
      />
      {entries === null ? (
        loading
      ) : (
        <>
          <Summary entries={entries} labels={labels} now={now} />
          {entries.length > 0 ? (
            <EntryList
            entries={entries}
            labels={labels}
            {...editing.listProps}
            now={now}
            collapse={collapse}
          />
          ) : (
            <p className="text-(--ui-muted-foreground)">
              {filtered ? "No entries match these filters." : "Nothing tracked yet."}
            </p>
          )}
        </>
      )}
      {editing.dialogs}
    </>
  )
}

export { HistoryView, TimerView }
