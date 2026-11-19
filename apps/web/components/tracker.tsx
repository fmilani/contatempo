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
import { toast } from "@ui-sdk/react/toast"
import { useCallback, useEffect, useRef, useState } from "react"
import { LABEL_COLORS, type Api, type Entry, type EntryInput, type Label } from "@/lib/api"
import { rangeToInstants, type DayRange } from "@/lib/time"
import { EntryDialog } from "./entry-dialog"
import { EntryList, entryName } from "./entry-list"
import { Filters } from "./filters"
import { Summary } from "./summary"
import { TimerBar } from "./timer-bar"

type TrackerProps = { api: Api; onSignOut?: () => Promise<void> }

const messageOf = (cause: unknown) => (cause instanceof Error ? cause.message : "Something went wrong")

function Tracker({ api, onSignOut }: TrackerProps) {
  const [labels, setLabels] = useState<Label[]>([])
  const [running, setRunning] = useState<Entry | null>(null)
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [range, setRange] = useState<DayRange | null>(null)
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [editing, setEditing] = useState<EntryInput | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  // Bumped when the entry dialog saves the running timer, so the card picks up its new values.
  const [runningVersion, setRunningVersion] = useState(0)
  const latest = useRef(0)

  const load = useCallback(async () => {
    const request = ++latest.current
    try {
      const instants = range ? rangeToInstants(range) : {}
      const [nextLabels, nextRunning, nextEntries] = await Promise.all([
        api.listLabels(),
        api.getRunning(),
        api.listEntries({ ...instants, labelIds }),
      ])
      if (request !== latest.current) return
      setLabels(nextLabels)
      setRunning(nextRunning)
      setEntries(nextEntries)
    } catch (cause) {
      if (request === latest.current) toast.error(messageOf(cause))
    }
  }, [api, range, labelIds])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load() only sets state after its requests resolve.
    void load()
    const onVisible = () => document.visibilityState === "visible" && void load()
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [load])

  async function run(action: () => Promise<void>) {
    try {
      await action()
    } catch (cause) {
      toast.error(messageOf(cause))
    }
    await load()
  }

  async function createLabel(name: string) {
    const existing = labels.find((label) => label.name.toLowerCase() === name.toLowerCase())
    if (existing) return existing
    const label = await api.createLabel(name, LABEL_COLORS[labels.length % LABEL_COLORS.length])
    setLabels((list) => [...list, label].sort((a, b) => a.name.localeCompare(b.name)))
    return label
  }

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
        key={runningVersion}
        running={running}
        labels={labels}
        onStart={() => run(() => api.startTimer("", []))}
        onStop={() => run(() => api.stopTimer())}
        onUpdate={async (entry) => {
          try {
            await api.saveEntry(entry)
            setRunning((current) => (current?.id === entry.id ? entry : current))
          } catch (cause) {
            toast.error(messageOf(cause))
          }
        }}
        onEdit={setEditing}
        onCreateLabel={createLabel}
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
        onSave={async (entry) => {
          await api.saveEntry(entry)
          await load()
          if (entry.endedAt === null) setRunningVersion((version) => version + 1)
        }}
        onCreateLabel={createLabel}
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
              action={() => (deleting ? run(() => api.deleteEntry(deleting.id)) : undefined)}
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
