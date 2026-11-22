"use client"

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ui-sdk/react/alert-dialog"
import { Button } from "@ui-sdk/react/button"
import { DateInput } from "@ui-sdk/react/date-input"
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@ui-sdk/react/dialog"
import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useId, useState, type FormEvent } from "react"
import type { Entry, Label } from "@/lib/api"
import { fromLocalInput, toLocalInput } from "@/lib/time"
import { entryName } from "./entry-list"
import { LabelPicker } from "./label-picker"

// A new entry has no id until it's saved.
export type EntryInput = Omit<Entry, "id"> & { id?: string }

type EntryDialogProps = {
  entry: EntryInput | null
  labels: Label[]
  onClose: () => void
  onSave: (entry: EntryInput) => void
  onDelete: (id: string) => void
  onCreateLabel: (name: string) => Label
}

function EntryForm({
  entry,
  labels,
  onClose,
  onSave,
  onDelete,
  onCreateLabel,
}: EntryDialogProps & { entry: EntryInput }) {
  const [description, setDescription] = useState(entry.description)
  const [labelIds, setLabelIds] = useState(entry.labelIds)
  const [start, setStart] = useState<string | null>(toLocalInput(entry.startedAt))
  const [end, setEnd] = useState<string | null>(entry.endedAt ? toLocalInput(entry.endedAt) : null)
  const [error, setError] = useState("")
  const formId = useId()

  // The inputs hold whole minutes, so a time that wasn't edited keeps its seconds.
  const instant = (local: string, original: string | null) =>
    original && local === toLocalInput(original) ? original : fromLocalInput(local)

  function submit(event: FormEvent) {
    event.preventDefault()
    const startedAt = start ? instant(start, entry.startedAt) : null
    const endedAt = end ? instant(end, entry.endedAt) : null
    const problem = !startedAt
      ? "Enter when it started."
      : !endedAt
        ? "Enter when it ended."
        : endedAt < startedAt
          ? "The end can't be before the start."
          : ""
    if (problem || !startedAt) {
      setError(problem)
      return
    }
    onSave({
      id: entry.id,
      description: description.trim(),
      labelIds,
      startedAt,
      endedAt,
    })
    onClose()
  }

  return (
    <>
      <form id={formId} onSubmit={submit} className="flex flex-col gap-4">
        <Field>
          <FieldLabel>Entry description</FieldLabel>
          <Input
            value={description}
            maxLength={500}
            onValueChange={(value) => setDescription(value)}
          />
        </Field>
        <LabelPicker
          name="Entry labels"
          placeholder="Add or create a label…"
          labels={labels}
          value={labelIds}
          onValueChange={setLabelIds}
          onCreate={onCreateLabel}
        />
        <div className="flex flex-wrap gap-4">
          <Field>
            <FieldLabel>Started at</FieldLabel>
            <DateInput
              granularity="minute"
              value={start}
              onValueChange={(value) => {
                setStart(value)
                setError("")
              }}
            />
          </Field>
          <Field>
            <FieldLabel>Ended at</FieldLabel>
            <DateInput
              granularity="minute"
              value={end}
              onValueChange={(value) => {
                setEnd(value)
                setError("")
              }}
            />
          </Field>
        </div>
        <Field invalid={error ? true : undefined}>
          {error ? <FieldError match>{error}</FieldError> : null}
        </Field>
      </form>
      {/* The confirmation is a dialog of its own, so it sits outside the form rather than nesting one. */}
      <div className="flex flex-wrap items-center gap-2">
        {entry.id ? (
          <DeleteEntry entry={{ ...entry, id: entry.id }} onDelete={onDelete} onClose={onClose} />
        ) : null}
        <span className="ms-auto flex gap-2">
          <DialogClose>Cancel</DialogClose>
          <Button type="submit" form={formId} data-variant="solid">
            Save entry
          </Button>
        </span>
      </div>
    </>
  )
}

// The confirmation opens over the edit dialog. Confirming deletes the entry and closes both.
function DeleteEntry({
  entry,
  onDelete,
  onClose,
}: {
  entry: Entry
  onDelete: (id: string) => void
  onClose: () => void
}) {
  return (
    <AlertDialog
      onOpenChange={(open, details) => {
        if (open || details.returnValue !== "confirm") return
        onDelete(entry.id)
        onClose()
      }}
    >
      <AlertDialogTrigger data-variant="destructive">Delete</AlertDialogTrigger>
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
        <AlertDialogDescription>{`${entryName(entry)} will be removed for good.`}</AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <AlertDialogClose>Keep entry</AlertDialogClose>
          <AlertDialogClose
            value="confirm"
            data-variant="destructive"
            data-agent-confirm={`Deletes the entry ${entryName(entry)}`}
          >
            Delete forever
          </AlertDialogClose>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// After a delete the row that opened the dialog is gone: focus goes to the row after it, else the
// one before, so keyboard and screen reader users stay in the list instead of at the top of the page.
function neighbourRow(id: string | undefined) {
  if (!id) return undefined
  const rows = [...document.querySelectorAll<HTMLElement>("[data-entry-id]")]
  const at = rows.findIndex((row) => row.dataset.entryId === id)
  if (at === -1) return undefined
  return rows[at + 1] ?? rows[at - 1]
}

function EntryDialog(props: EntryDialogProps) {
  const { entry, onClose } = props
  const [returnTo, setReturnTo] = useState<HTMLElement | undefined>()
  return (
    <Dialog
      open={entry !== null}
      onOpenChange={(open) => !open && onClose()}
      onOpenChangeComplete={(open) => !open && setReturnTo(undefined)}
    >
      <DialogBackdrop />
      <DialogContent finalFocus={returnTo ?? "trigger"}>
        <DialogTitle>{entry?.id ? "Edit entry" : "Add entry"}</DialogTitle>
        {entry ? (
          <EntryForm
            key={entry.id ?? "new"}
            {...props}
            entry={entry}
            onDelete={(id) => {
              setReturnTo(neighbourRow(id))
              props.onDelete(id)
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { EntryDialog }
