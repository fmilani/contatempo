"use client"

import { Button } from "@ui-sdk/react/button"
import { Input } from "@ui-sdk/react/input"
import { useEffect, useState, type FormEvent } from "react"
import type { Entry, Label } from "@/lib/api"
import { durationOf, formatClock } from "@/lib/time"
import { PencilIcon } from "./icons"
import { LabelDot, LabelPicker, usePendingCreate } from "./label-picker"

type TimerBarProps = {
  running: Entry | null
  labels: Label[]
  onStart: (description: string, labelIds: string[]) => Promise<void>
  onStop: () => Promise<void>
  onEdit: (entry: Entry) => void
  onCreateLabel: (name: string) => Promise<Label>
}

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

function TimerBar({ running, labels, onStart, onStop, onEdit, onCreateLabel }: TimerBarProps) {
  const [description, setDescription] = useState("")
  const [labelIds, setLabelIds] = useState<string[]>([])
  const [starting, setStarting] = useState(false)
  const labelCreation = usePendingCreate(onCreateLabel)

  if (running) {
    const runningLabels = labels.filter((label) => running.labelIds.includes(label.id))
    return (
      <section aria-label="Timer" className="card flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <p className={running.description ? "truncate font-medium" : "text-(--ui-muted-foreground)"}>
            {running.description || "No description"}
          </p>
          {runningLabels.length > 0 ? (
            <ul aria-label="Timer labels" className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm">
              {runningLabels.map((label) => (
                <li key={label.id} className="flex items-center gap-1.5">
                  <LabelDot color={label.color} />
                  {label.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <Elapsed key={running.id} entry={running} />
        <Button aria-label="Edit running timer" onClick={() => onEdit(running)}>
          <PencilIcon />
        </Button>
        <Button data-variant="solid" onClick={onStop}>
          Stop timer
        </Button>
      </section>
    )
  }

  async function start(event: FormEvent) {
    event.preventDefault()
    if (labelCreation.isPending()) return
    setStarting(true)
    try {
      await onStart(description.trim(), labelIds)
      setDescription("")
      setLabelIds([])
    } finally {
      setStarting(false)
    }
  }

  return (
    <section aria-label="Timer" className="card">
      <form onSubmit={start} className="grid gap-2 sm:grid-cols-[2fr_1.5fr_auto] sm:items-start">
        <Input
          aria-label="What are you working on?"
          placeholder="What are you working on?"
          maxLength={500}
          value={description}
          onValueChange={(value) => setDescription(value)}
        />
        <LabelPicker
          name="Timer labels"
          hideName
          placeholder="Add labels…"
          labels={labels}
          value={labelIds}
          onValueChange={setLabelIds}
          onCreate={labelCreation.create}
        />
        <Button
          type="submit"
          data-variant="solid"
          disabled={starting || labelCreation.pending}
          focusableWhenDisabled
        >
          Start timer
        </Button>
      </form>
    </section>
  )
}

export { TimerBar }
