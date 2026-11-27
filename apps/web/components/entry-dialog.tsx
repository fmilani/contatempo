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
import { useId, useRef, useState, type FormEvent } from "react"
import type { Entry, Label } from "@/lib/api"
import { labelIdsIn, normalizeDescription } from "@/lib/description"
import { fromLocalInput, toLocalInput } from "@/lib/time"
import { DescriptionInput } from "./description-input"

// A new entry, before it has an id.
export type EntryInput = Omit<Entry, "id">

type EntryDialogProps = {
  entry: EntryInput | null
  labels: Label[]
  onClose: () => void
  onSave: (entry: EntryInput) => void
  onCreateLabel: (name: string) => Label
}

// Adds a past entry by hand: its description, with labels typed in it with #, and its times.
// Existing entries are edited in their rows instead.
function EntryForm({
  entry,
  labels,
  onClose,
  onSave,
  onCreateLabel,
}: EntryDialogProps & { entry: EntryInput }) {
  const description = useRef(entry.description)
  const [start, setStart] = useState<string | null>(toLocalInput(entry.startedAt))
  const [end, setEnd] = useState<string | null>(entry.endedAt ? toLocalInput(entry.endedAt) : null)
  const [error, setError] = useState("")
  const formId = useId()
  const labelId = useId()
  const formRef = useRef<HTMLFormElement>(null)

  function submit(event?: FormEvent) {
    event?.preventDefault()
    const startedAt = start ? fromLocalInput(start) : null
    const endedAt = end ? fromLocalInput(end) : null
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
    const text = normalizeDescription(description.current)
    onSave({ description: text, labelIds: labelIdsIn(text, labels), startedAt, endedAt })
    onClose()
  }

  return (
    <>
      <form id={formId} ref={formRef} onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          {/* The editor isn't a native field, so the label names it by id rather than by `for`. */}
          <span id={labelId} className="text-sm font-medium">
            Entry description
          </span>
          <DescriptionInput
            className="description-editor description-editor-boxed"
            aria-labelledby={labelId}
            placeholder="What did you work on? Type # for labels"
            defaultValue={entry.description}
            labels={labels}
            onCreateLabel={onCreateLabel}
            onValueChange={(value) => (description.current = value)}
            onSubmit={() => formRef.current?.requestSubmit()}
          />
        </div>
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
      <div className="flex justify-end gap-2">
        <DialogClose>Cancel</DialogClose>
        <Button type="submit" form={formId} data-variant="solid">
          Save entry
        </Button>
      </div>
    </>
  )
}

function EntryDialog(props: EntryDialogProps) {
  const { entry, onClose } = props
  return (
    <Dialog
      // A bottom sheet on small touch screens, a centered dialog elsewhere.
      presentation="auto"
      open={entry !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogBackdrop />
      <DialogContent>
        <DialogTitle>Add entry</DialogTitle>
        {entry ? <EntryForm {...props} entry={entry} /> : null}
      </DialogContent>
    </Dialog>
  )
}

export { EntryDialog }
