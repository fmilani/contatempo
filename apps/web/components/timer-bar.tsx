"use client"

import { Button } from "@ui-sdk/react/button"
import {
  createDialogController,
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@ui-sdk/react/dialog"
import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuItemIndicator,
  MenuSeparator,
  MenuTrigger,
} from "@ui-sdk/react/menu"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { useEffect, useRef, useState, type FormEvent, type RefObject } from "react"
import type { Entry, Label } from "@/lib/api"
import { durationOf, formatClock } from "@/lib/time"
import { CheckIcon, PlayIcon, PlusIcon, StopIcon, TagIcon } from "./icons"
import { LabelDot } from "./label-picker"

type TimerBarProps = {
  running: Entry | null
  labels: Label[]
  onStart: () => void
  onStop: () => void
  onUpdate: (id: string, description: string, labelIds: string[]) => void
  onCreateLabel: (name: string) => Label
}

const SAVE_DELAY = 400

const createLabelDialog = () => createDialogController<unknown, unknown>()
type LabelDialogController = ReturnType<typeof createLabelDialog>

function Elapsed({ entry }: { entry: Entry }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])
  return (
    <span role="timer" aria-label="Elapsed time" className="font-mono text-2xl tabular-nums">
      {formatClock(durationOf(entry, now))}
    </span>
  )
}

function NewLabelDialog({
  controller,
  onCreate,
}: {
  controller: LabelDialogController
  onCreate: (name: string) => void
}) {
  const [name, setName] = useState("")

  function submit(event: FormEvent) {
    event.preventDefault()
    onCreate(name.trim())
    setName("")
    controller.close()
  }

  return (
    <Dialog controller={controller}>
      <DialogBackdrop />
      <DialogContent>
        <DialogTitle>New label</DialogTitle>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Label name</FieldLabel>
            <Input
              required
              maxLength={50}
              pattern=".*\S.*"
              value={name}
              onValueChange={(value) => setName(value)}
            />
            <FieldError match="valueMissing">Enter a name for the label.</FieldError>
            <FieldError match="patternMismatch">Enter a name for the label.</FieldError>
          </Field>
          <div className="flex justify-end gap-2">
            <DialogClose>Cancel</DialogClose>
            <Button type="submit" data-variant="solid">
              Create label
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

type DetailsProps = {
  entry: Entry
  labels: Label[]
  onUpdate: (id: string, description: string, labelIds: string[]) => void
  onCreateLabel: (name: string) => Label
  flushRef: RefObject<(() => void) | null>
  autoFocus: boolean
}

// Edits save on their own: labels at once, the description once typing pauses or the field
// loses focus. Stop sends what was just typed first, through `flushRef`.
function RunningDetails({
  entry,
  labels,
  onUpdate,
  onCreateLabel,
  flushRef,
  autoFocus,
}: DetailsProps) {
  const [description, setDescription] = useState(entry.description)
  const [labelIds, setLabelIds] = useState(entry.labelIds)
  const [newLabel] = useState(createLabelDialog)
  const initial = { description: entry.description, labelIds: entry.labelIds }
  const latest = useRef(initial)
  const saved = useRef(initial)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const descriptionRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // preventScroll keeps the page still while the card grows open.
    if (autoFocus) descriptionRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  function save() {
    clearTimeout(timer.current)
    const next = latest.current
    if (next === saved.current) return
    saved.current = next
    onUpdate(entry.id, next.description.trim(), next.labelIds)
  }

  const saveRef = useRef(save)
  useEffect(() => {
    saveRef.current = save
  })
  useEffect(() => {
    flushRef.current = () => saveRef.current()
    return () => {
      saveRef.current()
      flushRef.current = null
    }
  }, [flushRef])

  function changeLabels(next: string[]) {
    setLabelIds(next)
    latest.current = { ...latest.current, labelIds: next }
    save()
  }

  const selected = labels.filter((label) => labelIds.includes(label.id))

  return (
    <div className="flex flex-col gap-2 pt-3">
      <div className="flex items-center gap-2">
        <Input
          ref={descriptionRef}
          aria-label="What are you working on?"
          placeholder="What are you working on?"
          maxLength={500}
          className="min-w-0 flex-1"
          value={description}
          onValueChange={(value) => {
            setDescription(value)
            latest.current = { ...latest.current, description: value }
            clearTimeout(timer.current)
            timer.current = setTimeout(save, SAVE_DELAY)
          }}
          onBlur={save}
        />
        <Menu presentation="auto">
          <MenuTrigger aria-label="Choose timer labels">
            <TagIcon />
          </MenuTrigger>
          <MenuContent align="end">
            {labels.map((label) => (
              <MenuCheckboxItem
                key={label.id}
                value={label.id}
                label={label.name}
                checked={labelIds.includes(label.id)}
                onCheckedChange={(checked) =>
                  changeLabels(
                    checked ? [...labelIds, label.id] : labelIds.filter((id) => id !== label.id)
                  )
                }
              >
                <MenuItemIndicator>
                  <CheckIcon />
                </MenuItemIndicator>
                <span className="flex items-center gap-2">
                  <LabelDot color={label.color} />
                  {label.name}
                </span>
              </MenuCheckboxItem>
            ))}
            {labels.length > 0 ? <MenuSeparator /> : null}
            <MenuItem onSelect={() => void newLabel.open()}>
              <span className="flex items-center gap-2">
                <PlusIcon />
                New label…
              </span>
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
      {selected.length > 0 ? (
        <ul aria-label="Timer labels" className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
          {selected.map((label) => (
            <li key={label.id} className="flex items-center gap-1.5">
              <LabelDot color={label.color} />
              {label.name}
            </li>
          ))}
        </ul>
      ) : null}
      <NewLabelDialog
        controller={newLabel}
        onCreate={(name) => {
          const label = onCreateLabel(name)
          if (!latest.current.labelIds.includes(label.id)) {
            changeLabels([...latest.current.labelIds, label.id])
          }
        }}
      />
    </div>
  )
}

function TimerBar({ running, labels, onStart, onStop, onUpdate, onCreateLabel }: TimerBarProps) {
  const flushRef = useRef<(() => void) | null>(null)
  // Only a timer started here takes focus, not one that was already running when the page loaded.
  const [startedHere, setStartedHere] = useState<string | null>(null)
  const [pendingStart, setPendingStart] = useState(false)
  if (pendingStart && running) {
    setPendingStart(false)
    setStartedHere(running.id)
  }
  // The details stay on screen while the card shrinks after Stop, so the collapse can animate.
  const [shown, setShown] = useState(running)
  if (running && running !== shown) setShown(running)

  function toggle() {
    if (!running) {
      setPendingStart(true)
      return onStart()
    }
    flushRef.current?.()
    onStop()
  }

  useShortcut("s", toggle, {
    description: "Start or stop the timer",
  })
  const hint = useShortcutHint("s")

  return (
    <section aria-label="Timer" className="card timer-card" data-running={running ? "" : undefined}>
      <div className="flex items-center gap-3">
        <Button
          data-variant="solid"
          className="timer-toggle"
          aria-label={running ? "Stop timer" : "Start timer"}
          aria-keyshortcuts={hint.ariaKeyshortcuts}
          title={`${running ? "Stop" : "Start"} (${hint.text.replace(/[\u2066-\u2069]/g, "")})`}
          onClick={toggle}
        >
          <span className="timer-icon timer-icon-start">
            <PlayIcon />
          </span>
          <span className="timer-icon timer-icon-stop">
            <StopIcon />
          </span>
        </Button>
        {running ? (
          <Elapsed key={running.id} entry={running} />
        ) : (
          <span className="font-mono text-2xl tabular-nums text-(--ui-muted-foreground)">
            0:00:00
          </span>
        )}
      </div>
      <div className="timer-details" inert={!running}>
        <div>
          {shown ? (
            <RunningDetails
              key={shown.id}
              entry={shown}
              labels={labels}
              onUpdate={onUpdate}
              onCreateLabel={onCreateLabel}
              flushRef={flushRef}
              autoFocus={shown.id === startedHere}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}

export { TimerBar }
