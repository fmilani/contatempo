"use client"

import { Button } from "@ui-sdk/react/button"
import Link from "next/link"
import { useState } from "react"
import { inFilter, type Api } from "@/lib/api"
import type { HistoryQuery } from "@/lib/history-query"
import { EntryDialog, type EntryInput } from "./entry-dialog"
import { EntryList } from "./entry-list"
import { Filters } from "./filters"
import { Summary } from "./summary"
import { TimerBar } from "./timer-bar"
import { useNow } from "./use-now"
import { useTracker } from "./use-tracker"

export const RECENT_LIMIT = 10

type Tracker = ReturnType<typeof useTracker>

// The dialog that adds, edits and deletes entries, shared by the pages that list them.
function useEntryEditing(tracker: Tracker) {
  const [editing, setEditing] = useState<EntryInput | null>(null)

  function addEntry() {
    const end = new Date()
    end.setSeconds(0, 0)
    setEditing({
      description: "",
      labelIds: [],
      startedAt: new Date(end.getTime() - 60 * 60 * 1000).toISOString(),
      endedAt: end.toISOString(),
    })
  }

  const dialogs = (
    <EntryDialog
      entry={editing}
      labels={tracker.labels}
      onClose={() => setEditing(null)}
      onSave={(draft) => {
        tracker.saveEntry({ ...draft, id: draft.id ?? crypto.randomUUID() }, !draft.id)
      }}
      onDelete={tracker.deleteEntry}
      onCreateLabel={tracker.createLabel}
    />
  )

  return { open: setEditing, addEntry, dialogs }
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
  const { labels, running, entries } = tracker

  return (
    <>
      <TimerBar
        loaded={entries !== null}
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
          {entries?.length ? <Button render={<Link href="/history" />}>See all history</Button> : null}
        </div>
        {entries === null ? (
          loading
        ) : entries.length > 0 ? (
          <EntryList entries={entries} labels={labels} onOpen={editing.open} />
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

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">History</h1>
        <Button onClick={editing.addEntry}>Add entry</Button>
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
            <EntryList entries={entries} labels={labels} onOpen={editing.open} now={now} />
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
