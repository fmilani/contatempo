"use client"

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
import { useState, type FormEvent } from "react"
import type { EntryInput, Label } from "@/lib/api"
import { fromLocalInput, toLocalInput } from "@/lib/time"
import { LabelPicker } from "./label-picker"

type EntryDialogProps = {
  entry: EntryInput | null
  labels: Label[]
  onClose: () => void
  onSave: (entry: EntryInput) => Promise<void>
  onCreateLabel: (name: string) => Promise<Label>
}

function EntryForm({
  entry,
  labels,
  onClose,
  onSave,
  onCreateLabel,
}: EntryDialogProps & { entry: EntryInput }) {
  const running = entry.endedAt === null
  const [description, setDescription] = useState(entry.description)
  const [labelIds, setLabelIds] = useState(entry.labelIds)
  const [start, setStart] = useState<string | null>(toLocalInput(entry.startedAt))
  const [end, setEnd] = useState<string | null>(entry.endedAt ? toLocalInput(entry.endedAt) : null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // The inputs hold whole minutes, so a time that wasn't edited keeps its seconds.
  const instant = (local: string, original: string | null) =>
    original && local === toLocalInput(original) ? original : fromLocalInput(local)

  async function submit(event: FormEvent) {
    event.preventDefault()
    const startedAt = start ? instant(start, entry.startedAt) : null
    const endedAt = running || !end ? null : instant(end, entry.endedAt)
    const problem = !startedAt
      ? "Enter when it started."
      : running
        ? Date.parse(startedAt) > Date.now()
          ? "A running timer can't start in the future."
          : ""
        : !endedAt
          ? "Enter when it ended."
          : endedAt < startedAt
            ? "The end can't be before the start."
            : ""
    if (problem || !startedAt) {
      setError(problem)
      return
    }
    setSaving(true)
    try {
      await onSave({ id: entry.id, description: description.trim(), labelIds, startedAt, endedAt })
      onClose()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Couldn't save the entry.")
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
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
        {running ? null : (
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
        )}
      </div>
      <Field invalid={error ? true : undefined}>
        {error ? <FieldError match>{error}</FieldError> : null}
      </Field>
      <div className="flex justify-end gap-2">
        <DialogClose>Cancel</DialogClose>
        <Button type="submit" data-variant="solid" disabled={saving} focusableWhenDisabled>
          Save entry
        </Button>
      </div>
    </form>
  )
}

function EntryDialog(props: EntryDialogProps) {
  const { entry, onClose } = props
  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogBackdrop />
      <DialogContent>
        <DialogTitle>
          {!entry?.id ? "Add entry" : entry.endedAt === null ? "Edit running timer" : "Edit entry"}
        </DialogTitle>
        {entry ? <EntryForm key={entry.id ?? "new"} {...props} entry={entry} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export { EntryDialog }
