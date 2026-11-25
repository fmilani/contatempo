"use client"

import { Button } from "@ui-sdk/react/button"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
import { TimeInput, createTimeInputController } from "@ui-sdk/react/time-input"
import { Toggle } from "@ui-sdk/react/toggle"
import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTitle,
} from "@ui-sdk/react/timeline"
import type { Entry, Label } from "@/lib/api"
import { dateKey, durationOf, formatDuration } from "@/lib/time"
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react"
import { ChevronDownIcon, CollapseAllIcon, ExpandAllIcon } from "./icons"
import { LabelDot } from "./label-picker"

type EntryListProps = {
  entries: Entry[]
  labels: Label[]
  onOpen: (entry: Entry) => void
  // Saves an entry whose start or end time was changed in its row. Without it the times are text.
  onSave?: (entry: Entry) => void
  // Where a running entry's time ends, so its row and its day's subtotal keep counting.
  now?: number
  // Which days are collapsed, when the page shares it with a collapse-all toggle.
  collapse?: DayCollapse
}

const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
})
// Shorter day names on narrow screens, so a day's name fits on one line with its entry count and
// total. The year is left out there; screen readers still get the full date.
const shortDayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
})
const timeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
})
// Two-digit hours in the list, so the times line up row under row: 09:05, not 9:05.
const rowTimeFormat = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
})

function entryName(entry: Entry) {
  const start = new Date(entry.startedAt)
  return `${entry.description || "entry"} at ${timeFormat.format(start)}, ${dayFormat.format(start)}`
}

// The time editor shows the same clock as the list: the browser's language and its 12 or 24 hours.
const rowTimeOptions = rowTimeFormat.resolvedOptions()
const rowHourCycle = rowTimeOptions.hourCycle === "h11" || rowTimeOptions.hourCycle === "h12" ? 12 : 24
const pad2 = (n: number) => String(n).padStart(2, "0")
const toClock = (iso: string) => {
  const date = new Date(iso)
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

type Edge = "start" | "end"

// A new time on the same day as the old one. The seconds go, since the editor shows minutes.
function withClock(iso: string, clock: string) {
  const [hours, minutes] = clock.split(":").map(Number)
  const date = new Date(iso)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

// The start or end of a finished entry: text that turns into a time input in place when pressed.
// Enter or leaving it saves, Escape puts the time back. An end before the start isn't saved.
function EntryTime({ entry, edge, onSave }: { entry: Entry; edge: Edge; onSave: (entry: Entry) => void }) {
  const iso = (edge === "start" ? entry.startedAt : entry.endedAt) as string
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  const [invalid, setInvalid] = useState(false)
  // The input takes the text's exact width, so nothing around it moves.
  const [width, setWidth] = useState<number | undefined>()
  const [controller] = useState(createTimeInputController)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const refocus = useRef(false)
  const shown = rowTimeFormat.format(new Date(iso))

  useEffect(() => {
    if (editing) controller.focus()
    else if (refocus.current) {
      refocus.current = false
      buttonRef.current?.focus()
    }
  }, [editing, controller])

  function close(keepFocus: boolean) {
    refocus.current = keepFocus
    setEditing(false)
    setInvalid(false)
  }

  // Returns false when the time can't be saved, so the input stays open to fix it.
  function commit() {
    if (!value || value === toClock(iso)) return true
    const next =
      edge === "start"
        ? { ...entry, startedAt: withClock(entry.startedAt, value) }
        : { ...entry, endedAt: withClock(iso, value) }
    if (Date.parse(next.endedAt as string) < Date.parse(next.startedAt)) {
      setInvalid(true)
      return false
    }
    onSave(next)
    return true
  }

  if (!editing) {
    return (
      <button
        ref={buttonRef}
        type="button"
        className="entry-time"
        aria-label={
          edge === "start"
            ? `Change start time of ${entryName(entry)}`
            : `Change end time of ${entryName(entry)}, ended ${shown}`
        }
        onClick={(event) => {
          setWidth(event.currentTarget.getBoundingClientRect().width)
          setValue(toClock(iso))
          setEditing(true)
        }}
      >
        {shown}
      </button>
    )
  }

  return (
    <TimeInput
      controller={controller}
      className="entry-time-edit"
      style={{ width }}
      aria-label={`${edge === "start" ? "Start" : "End"} time of ${entryName(entry)}`}
      aria-invalid={invalid || undefined}
      data-bad={invalid ? "" : undefined}
      title={invalid ? "The end can't be before the start" : undefined}
      locale={rowTimeOptions.locale}
      hourCycle={rowHourCycle}
      value={value}
      onValueChange={(next) => {
        setValue(next)
        setInvalid(false)
      }}
      onKeyDown={(event: KeyboardEvent) => {
        if (event.key === "Enter") {
          event.preventDefault()
          if (commit()) close(true)
        } else if (event.key === "Escape") {
          // Only the edit is canceled, not a dialog or anything around it.
          event.preventDefault()
          event.stopPropagation()
          close(true)
        }
      }}
      onBlur={(event: FocusEvent<HTMLElement>) => {
        // Moving between the hour and minute stays inside; leaving saves, or puts back a bad time.
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
        commit()
        close(false)
      }}
    />
  )
}

function RowTimes({ entry, onSave }: { entry: Entry; onSave?: (entry: Entry) => void }) {
  return (
    // tabular-nums gives every digit the same width, so times and durations line up across rows.
    <span className="entry-times tabular-nums text-sm text-(--ui-muted-foreground)">
      {entry.endedAt && onSave ? (
        <>
          <EntryTime entry={entry} edge="start" onSave={onSave} />
          <span className="entry-dash">–</span>
          <EntryTime entry={entry} edge="end" onSave={onSave} />
        </>
      ) : (
        <>
          {rowTimeFormat.format(new Date(entry.startedAt))}
          <span className="entry-dash">–</span>
          {entry.endedAt ? (
            rowTimeFormat.format(new Date(entry.endedAt))
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="live-dot" />
              now
            </span>
          )}
        </>
      )}
    </span>
  )
}

// The description, labels and duration: inside the row's button, which covers the whole row.
function RowContent({
  entry,
  byId,
  now,
}: {
  entry: Entry
  byId: Map<string, Label>
  now?: number
}) {
  return (
    <>
      <span className="entry-main min-w-0 text-start">
        <span
          className={
            entry.description ? "block truncate" : "block text-(--ui-muted-foreground)"
          }
        >
          {entry.description || "No description"}
        </span>
        {entry.labelIds.length > 0 ? (
          <span className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-(--ui-muted-foreground)">
            {entry.labelIds.map((id) => (
              <span key={id} className="flex items-center gap-1.5">
                <LabelDot color={byId.get(id)?.color ?? "transparent"} />
                {byId.get(id)?.name}
              </span>
            ))}
          </span>
        ) : null}
      </span>
      <span className="entry-duration text-end font-medium tabular-nums">
        {formatDuration(durationOf(entry, now))}
      </span>
    </>
  )
}

function groupByDay(entries: Entry[]) {
  const days = new Map<string, Entry[]>()
  for (const entry of entries) {
    const key = dateKey(new Date(entry.startedAt))
    days.set(key, [...(days.get(key) ?? []), entry])
  }
  return days
}

// Which days are collapsed, by date. Days start open, and stay as you left them while the list
// updates. The page holds it, so the list and its collapse-all toggle share it.
function useDayCollapse(entries: Entry[] | null) {
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set())
  const keys = entries ? [...groupByDay(entries).keys()] : []
  const allClosed = keys.length > 0 && keys.every((key) => closed.has(key))
  return {
    closed,
    allClosed,
    setDay(key: string, open: boolean) {
      setClosed((current) => {
        const next = new Set(current)
        if (open) next.delete(key)
        else next.add(key)
        return next
      })
    },
    setAll(collapse: boolean) {
      setClosed(collapse ? new Set(keys) : new Set())
    },
  }
}

type DayCollapse = ReturnType<typeof useDayCollapse>

// Collapses or expands every day at once, the same as the C key. Pressed while all are collapsed.
function CollapseAllToggle({ collapse }: { collapse: DayCollapse }) {
  const hint = useShortcutHint("c")
  const keyText = hint.text.replace(/[\u2066-\u2069]/g, "")
  return (
    <Toggle
      className="collapse-toggle"
      aria-label="Collapse all days"
      aria-keyshortcuts={hint.ariaKeyshortcuts}
      title={`${collapse.allClosed ? "Expand" : "Collapse"} all days (${keyText})`}
      pressed={collapse.allClosed}
      onPressedChange={(pressed) => collapse.setAll(pressed)}
    >
      {collapse.allClosed ? <ExpandAllIcon /> : <CollapseAllIcon />}
    </Toggle>
  )
}

function EntryList({ entries, labels, onOpen, onSave, now, collapse: shared }: EntryListProps) {
  const byId = new Map(labels.map((label) => [label.id, label]))
  const days = groupByDay(entries)
  const own = useDayCollapse(entries)
  const collapse = shared ?? own
  const { closed } = collapse
  const listRef = useRef<HTMLDivElement>(null)

  const anyOpen = !collapse.allClosed

  // C collapses every day, or expands them all when they're all collapsed already.
  useShortcut(
    "c",
    () => {
      // Focus inside a day's entries would be lost when they unmount: keep it on the day instead.
      const active = document.activeElement as HTMLElement | null
      const day = active?.closest<HTMLElement>("[data-day]")
      if (anyOpen && day && listRef.current?.contains(day) && active !== day) day.focus()
      collapse.setAll(anyOpen)
    },
    {
      description: anyOpen ? "Collapse all days" : "Expand all days",
      // Next keeps a page you left in the document, hidden. Only the list on screen answers C.
      when: () => days.size > 0 && listRef.current?.checkVisibility() === true,
    }
  )
  const hint = useShortcutHint("c")
  // useShortcutHint wraps the keys in invisible direction marks, which show as boxes in a title.
  const keyText = hint.text.replace(/[\u2066-\u2069]/g, "")

  return (
    // One point per day, with that day's entries under it. Arrow keys move between days, Tab goes
    // from a day to its header button, which collapses it, and then into its entries.
    <Timeline
      ref={listRef}
      aria-label="Entries by day"
      aria-keyshortcuts={hint.ariaKeyshortcuts}
      className="day-timeline"
    >
      {[...days].map(([key, dayEntries]) => {
        const first = new Date(dayEntries[0].startedAt)
        const open = !closed.has(key)
        return (
          <TimelineItem key={key} value={key} className="day-item" data-day={key}>
            <TimelineMarker />
            <TimelineConnector />
            <Collapsible
              open={open}
              onOpenChange={(next) => collapse.setDay(key, next)}
              className="day-collapsible"
            >
              <TimelineTitle render={<h2 />} className="day-title">
                <CollapsibleTrigger
                  className="day-trigger"
                  title={`${open ? "Collapse" : "Expand"} · ${keyText} ${anyOpen ? "collapses" : "expands"} all days`}
                >
                  <time dateTime={key}>
                    <span className="day-name-long">{dayFormat.format(first)}</span>
                    <span className="day-name-short" aria-hidden="true">
                      {shortDayFormat.format(first)}
                    </span>
                  </time>
                  <ChevronDownIcon />
                </CollapsibleTrigger>
                <span className="day-count text-sm tabular-nums text-(--ui-muted-foreground)">
                  <span className="sr-only">, </span>
                  {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"}
                </span>
              </TimelineTitle>
              <TimelineDescription className="day-total text-sm tabular-nums text-(--ui-muted-foreground)">
                {formatDuration(dayEntries.reduce((sum, entry) => sum + durationOf(entry, now), 0))}
                <span className="sr-only"> tracked</span>
                {open ? null : <span className="sr-only">, entries hidden</span>}
              </TimelineDescription>
              <CollapsiblePanel className="day-panel">
                <ul className="day-entries">
                  {dayEntries.map((entry) => (
                    <li key={entry.id} className="border-b border-(--ui-border) last:border-b-0">
                      {entry.endedAt === null ? (
                        // The running timer is edited on its card, so its row only shows it.
                        <div className="entry-row" data-running="" data-entry-id={entry.id}>
                          <div className="entry-open">
                            <RowContent entry={entry} byId={byId} now={now} />
                          </div>
                          <RowTimes entry={entry} />
                        </div>
                      ) : (
                        // The button covers the whole row and opens the entry; its name is the entry,
                        // so the content stays visible text. The times sit on top, each its own button.
                        <div className="entry-row">
                          <Button
                            className="entry-open"
                            data-entry-id={entry.id}
                            aria-label={`Edit ${entryName(entry)}`}
                            onClick={() => onOpen(entry)}
                          >
                            <RowContent entry={entry} byId={byId} now={now} />
                          </Button>
                          <RowTimes entry={entry} onSave={onSave} />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CollapsiblePanel>
            </Collapsible>
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}

export { CollapseAllToggle, EntryList, entryName, useDayCollapse }
