"use client"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@ui-sdk/react/alert-dialog"
import { Button } from "@ui-sdk/react/button"
import { OverlayHost } from "@ui-sdk/react/overlays"
import { useState } from "react"
import type { Api, Entry } from "@/lib/api"
import type { DayRange } from "@/lib/time"
import { EntryDialog, type EntryInput } from "./entry-dialog"
import { EntryList, entryName } from "./entry-list"
import { Filters } from "./filters"
import { Summary } from "./summary"
import { TimerBar } from "./timer-bar"
import { useTracker } from "./use-tracker"

type TrackerProps = { api: Api; onSignOut?: () => Promise<void> }

function Tracker({ api, onSignOut }: TrackerProps) {
  const [range, setRange] = useState<DayRange | null>(null)
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [editing, setEditing] = useState<EntryInput | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const tracker = useTracker(api, range, labelIds)
  const { labels, running, entries } = tracker

  function askToDelete(entry: Entry) {
    setDeleting(entry)
    setConfirmingDelete(true)
  }

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

  const filtered = range !== null || labelIds.length > 0

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">contatempo</h1>
        {onSignOut ? <Button onClick={onSignOut}>Sign out</Button> : null}
      </header>
      <TimerBar
        loaded={entries !== null}
        running={running}
        labels={labels}
        onStart={tracker.start}
        onStop={tracker.stop}
        onUpdate={tracker.setDetails}
        onCreateLabel={tracker.createLabel}
      />
      <Filters
        labels={labels}
        range={range}
        labelIds={labelIds}
        onRangeChange={setRange}
        onLabelIdsChange={setLabelIds}
      />
      {entries === null ? (
        <p role="status" className="text-(--ui-muted-foreground)">
          Loading entries…
        </p>
      ) : (
        <>
          <Summary entries={entries} labels={labels} />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Entries</h2>
            <Button onClick={addEntry}>Add entry</Button>
          </div>
          {entries.length > 0 ? (
            <EntryList entries={entries} labels={labels} onEdit={setEditing} onDelete={askToDelete} />
          ) : (
            <p className="text-(--ui-muted-foreground)">
              {filtered
                ? "No entries match these filters."
                : "Nothing tracked yet. Start the timer, or add an entry by hand."}
            </p>
          )}
        </>
      )}
      <EntryDialog
        entry={editing}
        labels={labels}
        onClose={() => setEditing(null)}
        onSave={(draft) => {
          tracker.saveEntry({ ...draft, id: draft.id ?? crypto.randomUUID() }, !draft.id)
        }}
        onCreateLabel={tracker.createLabel}
      />
      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
          <AlertDialogDescription>
            {deleting ? `${entryName(deleting)} will be removed for good.` : ""}
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogClose>Keep entry</AlertDialogClose>
            <AlertDialogClose
              value="confirm"
              data-variant="destructive"
              data-agent-confirm={deleting ? `Deletes the entry ${entryName(deleting)}` : undefined}
              onClick={() => deleting && tracker.deleteEntry(deleting.id)}
            >
              Delete forever
            </AlertDialogClose>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      <OverlayHost toast={{ "data-agent-hidden": "" } as object} />
    </div>
  )
}

export { Tracker }
