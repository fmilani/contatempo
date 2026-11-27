"use client"

import { Button } from "@ui-sdk/react/button"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { useEffect, useRef, useState, type RefObject } from "react"
import type { Entry, Label } from "@/lib/api"
import { durationOf, formatClock } from "@/lib/time"
import { labelIdsIn, normalizeDescription } from "@/lib/description"
import { DescriptionInput } from "./description-input"
import { PlayIcon, StopIcon } from "./icons"

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
  autoFocus: boolean
  // False while the details fade out after Stop: the clock keeps its last value.
  ticking: boolean
}

// useShortcutHint wraps the keys in invisible direction marks, which show as boxes in a title.
const plain = (text: string) => text.replace(/[\u2066-\u2069]/g, "")

// The description saves on its own, once typing pauses or the field loses focus, and its labels
// with it: they're the ones typed into it with #. Stop sends what was just typed first, through
// `flushRef`.
function RunningDetails({
  entry,
  labels,
  onUpdate,
  onCreateLabel,
  flushRef,
  autoFocus,
  ticking,
}: DetailsProps) {
  const latest = useRef(entry.description)
  const saved = useRef(entry.description)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const descriptionRef = useRef<HTMLDivElement>(null)
  // The labels as of the latest render, including one just created from the menu.
  const latestLabels = useRef(labels)
  useEffect(() => {
    latestLabels.current = labels
  })

  useEffect(() => {
    // preventScroll keeps the page still while the card grows open.
    if (autoFocus) descriptionRef.current?.focus({ preventScroll: true })
  }, [autoFocus])

  function save() {
    clearTimeout(timer.current)
    const next = normalizeDescription(latest.current)
    if (next === saved.current) return
    saved.current = next
    onUpdate(entry.id, next, labelIdsIn(next, latestLabels.current))
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

  // One grid, so the clock can sit beside the description, or below it on narrow screens.
  return (
    <div className="timer-body">
      <div className="timer-description">
        <DescriptionInput
          editorRef={descriptionRef}
          className="description-editor description-editor-boxed"
          aria-label="What are you working on?"
          placeholder="What are you working on? Type # for labels"
          defaultValue={entry.description}
          labels={labels}
          onCreateLabel={onCreateLabel}
          onValueChange={(value) => {
            latest.current = value
            clearTimeout(timer.current)
            timer.current = setTimeout(save, SAVE_DELAY)
          }}
          // Enter or Escape is done typing: leave the field, which saves it, so S stops the timer.
          onSubmit={() => descriptionRef.current?.blur()}
          onEscape={() => descriptionRef.current?.blur()}
          onBlur={save}
        />
      </div>
      <div className="timer-reveal timer-clock">
        <div>
          <Elapsed entry={entry} ticking={ticking} />
        </div>
      </div>
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
