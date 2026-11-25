"use client"

import { Button } from "@ui-sdk/react/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ComboboxTrigger,
  createComboboxController,
} from "@ui-sdk/react/combobox"
import { Input } from "@ui-sdk/react/input"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { useEffect, useRef, useState, type RefObject } from "react"
import type { Entry, Label } from "@/lib/api"
import { durationOf, formatClock } from "@/lib/time"
import { CheckIcon, PlayIcon, PlusIcon, StopIcon, TagIcon } from "./icons"
import { LabelDot } from "./label-picker"

type TimerBarProps = {
  loaded: boolean
  running: Entry | null
  labels: Label[]
  onStart: () => void
  onStop: () => void
  onUpdate: (id: string, description: string, labelIds: string[]) => void
  onCreateLabel: (name: string) => Label
}

const SAVE_DELAY = 400

// Stops ticking, and keeps its last value, while the clock fades out after Stop.
function Elapsed({ entry, ticking }: { entry: Entry; ticking: boolean }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!ticking) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [ticking])
  return (
    <span role="timer" aria-label="Elapsed time" className="font-mono text-2xl tabular-nums">
      {formatClock(durationOf(entry, now))}
    </span>
  )
}

type DetailsProps = {
  entry: Entry
  labels: Label[]
  onUpdate: (id: string, description: string, labelIds: string[]) => void
  onCreateLabel: (name: string) => Label
  flushRef: RefObject<(() => void) | null>
  labelPicker: LabelPickerController
  autoFocus: boolean
  // False while the details fade out after Stop: the clock keeps its last value.
  ticking: boolean
}

// Edits save on their own: labels at once, the description once typing pauses or the field
// loses focus. Stop sends what was just typed first, through `flushRef`.
const createLabelPicker = () => createComboboxController<string, true>()
type LabelPickerController = ReturnType<typeof createLabelPicker>

// useShortcutHint wraps the keys in invisible direction marks, which show as boxes in a title.
const plain = (text: string) => text.replace(/[\u2066-\u2069]/g, "")

function RunningDetails({
  entry,
  labels,
  onUpdate,
  onCreateLabel,
  flushRef,
  labelPicker,
  autoFocus,
  ticking,
}: DetailsProps) {
  const [description, setDescription] = useState(entry.description)
  const [labelIds, setLabelIds] = useState(entry.labelIds)
  const [query, setQuery] = useState("")
  const [trigger, setTrigger] = useState<HTMLButtonElement | null>(null)
  const initial = { description: entry.description, labelIds: entry.labelIds }
  const latest = useRef(initial)
  const saved = useRef(initial)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const labelHint = useShortcutHint("l")

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

  // One grid, so the clock can sit beside the description, or below it on narrow screens.
  return (
    <div className="timer-body">
      <Input
        ref={descriptionRef}
        aria-label="What are you working on?"
        placeholder="What are you working on?"
        maxLength={500}
        className="timer-description"
        value={description}
        onValueChange={(value) => {
          setDescription(value)
          latest.current = { ...latest.current, description: value }
          clearTimeout(timer.current)
          timer.current = setTimeout(save, SAVE_DELAY)
        }}
        onBlur={save}
        // Enter or Escape is done typing: leave the field, which saves it, so S stops the timer.
        // IME composition uses Enter to pick a word, so that one stays in the field.
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing) return
          if (event.key === "Enter" || event.key === "Escape") {
            event.preventDefault()
            event.currentTarget.blur()
          }
        }}
      />
      <Combobox
        multiple
        autoHighlight
        controller={labelPicker}
        value={labelIds}
        onValueChange={(next) => changeLabels(next as string[])}
        itemToLabel={(id) => labels.find((label) => label.id === id)?.name ?? ""}
        query={query}
        onQueryChange={setQuery}
        onOpenChangeComplete={(open) => !open && trigger?.focus()}
      >
        <ComboboxTrigger
          ref={setTrigger}
          aria-label="Choose timer labels"
          aria-keyshortcuts={labelHint.ariaKeyshortcuts}
          title={`Labels (${plain(labelHint.text)})`}
          className="label-trigger"
        >
          <TagIcon />
        </ComboboxTrigger>
        <ComboboxContent anchor={trigger} align="end" className="label-popup">
          <ComboboxInput
            autoFocus
            aria-label="Find or create a label"
            placeholder="Find or create a label…"
            maxLength={50}
            className="label-popup-input"
          />
          <ComboboxEmpty>
            {(state) => (state.empty && !state.query.trim() ? "No labels yet. Type a name to create one." : null)}
          </ComboboxEmpty>
          <ComboboxList>
            {labels.map((label) => (
              <ComboboxItem key={label.id} value={label.id} label={label.name}>
                <LabelDot color={label.color} />
                {label.name}
                <ComboboxItemIndicator>
                  <CheckIcon />
                </ComboboxItemIndicator>
              </ComboboxItem>
            ))}
            <ComboboxCreate
              className="label-create"
              onCreate={(name) => {
                const label = onCreateLabel(name.trim())
                if (!latest.current.labelIds.includes(label.id)) {
                  changeLabels([...latest.current.labelIds, label.id])
                }
                setQuery("")
              }}
            >
              {(state) => (
                <>
                  <PlusIcon />
                  <span>Create “{state.query.trim()}”</span>
                </>
              )}
            </ComboboxCreate>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <div className="timer-reveal timer-clock">
        <div>
          <Elapsed entry={entry} ticking={ticking} />
        </div>
      </div>
      {selected.length > 0 ? (
        <div className="timer-reveal timer-labels">
          <div>
            <ul aria-label="Timer labels" className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {selected.map((label) => (
                <li key={label.id} className="flex items-center gap-1.5">
                  <LabelDot color={label.color} />
                  {label.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function TimerBar({ loaded, running, labels, onStart, onStop, onUpdate, onCreateLabel }: TimerBarProps) {
  // Transitions turn on a frame after the first load, so a timer that was already running
  // appears in place instead of sliding in.
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    if (!loaded) return
    const frame = requestAnimationFrame(() => setAnimated(true))
    return () => cancelAnimationFrame(frame)
  }, [loaded])
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

  const [labelPicker] = useState(createLabelPicker)
  useShortcut(running ? "l" : null, () => labelPicker.open(), {
    description: "Choose the running timer's labels",
  })

  return (
    <section
      aria-label="Timer"
      className="card timer-card"
      data-running={running ? "" : undefined}
      data-animated={animated ? "" : undefined}
    >
      <div className="timer-head">
        <Button
          data-variant="solid"
          className="timer-toggle"
          aria-label={running ? "Stop timer" : "Start timer"}
          aria-keyshortcuts={hint.ariaKeyshortcuts}
          title={`${running ? "Stop" : "Start"} (${plain(hint.text)})`}
          onClick={toggle}
        >
          <span className="timer-icon timer-icon-start">
            <PlayIcon />
          </span>
          <span className="timer-icon timer-icon-stop">
            <StopIcon />
          </span>
        </Button>
        <div className="timer-details" inert={!running}>
          {shown ? (
            <RunningDetails
              key={shown.id}
              entry={shown}
              labels={labels}
              onUpdate={onUpdate}
              onCreateLabel={onCreateLabel}
              flushRef={flushRef}
              labelPicker={labelPicker}
              autoFocus={shown.id === startedHere}
              ticking={Boolean(running)}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}

export { TimerBar }
