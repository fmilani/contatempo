"use client"

import { Button } from "@ui-sdk/react/button"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@ui-sdk/react/collapsible"
import { useShortcut, useShortcutHint } from "@ui-sdk/react/shortcuts"
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
import { useRef, useState } from "react"
import { ChevronDownIcon } from "./icons"
import { LabelDot } from "./label-picker"

type EntryListProps = {
  entries: Entry[]
  labels: Label[]
  onOpen: (entry: Entry) => void
  // Where a running entry's time ends, so its row and its day's subtotal keep counting.
  now?: number
}

const dayFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
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
      {/* tabular-nums gives every digit the same width, so times and durations line up across rows. */}
      <span className="entry-times tabular-nums text-sm text-(--ui-muted-foreground)">
        {rowTimeFormat.format(new Date(entry.startedAt))} –{" "}
        {entry.endedAt ? (
          rowTimeFormat.format(new Date(entry.endedAt))
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="live-dot" />
            now
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 text-start">
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
      <span className="w-16 shrink-0 text-end font-medium tabular-nums">
        {formatDuration(durationOf(entry, now))}
      </span>
    </>
  )
}

function EntryList({ entries, labels, onOpen, now }: EntryListProps) {
  const byId = new Map(labels.map((label) => [label.id, label]))
  const days = new Map<string, Entry[]>()
  for (const entry of entries) {
    const key = dateKey(new Date(entry.startedAt))
    days.set(key, [...(days.get(key) ?? []), entry])
  }
  // Closed days, by date. Days open by default, and stay as you left them while the list updates.
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set())
  const listRef = useRef<HTMLDivElement>(null)

  function setOpen(key: string, open: boolean) {
    setClosed((current) => {
      const next = new Set(current)
      if (open) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // C collapses or expands the day with focus, or the most recent day when focus is elsewhere.
  useShortcut(
    "c",
    () => {
      const focused = (document.activeElement as HTMLElement | null)?.closest<HTMLElement>("[data-day]")
      const inList = focused && listRef.current?.contains(focused)
      const key = inList ? focused.dataset.day : [...days.keys()][0]
      if (key) setOpen(key, closed.has(key))
    },
    {
      description: "Collapse or expand a day",
      // Next keeps a page you left in the document, hidden. Only the list on screen answers C.
      when: () => days.size > 0 && listRef.current?.checkVisibility() === true,
    }
  )
  const hint = useShortcutHint("c")

  return (
    // One point per day, with that day's entries under it. Arrow keys move between days, Tab goes
    // from a day to its header button, which collapses it, and then into its entries.
    <Timeline ref={listRef} aria-label="Entries by day" className="day-timeline">
      {[...days].map(([key, dayEntries]) => {
        const first = new Date(dayEntries[0].startedAt)
        const open = !closed.has(key)
        return (
          <TimelineItem key={key} value={key} className="day-item" data-day={key}>
            <TimelineMarker />
            <TimelineConnector />
            <Collapsible open={open} onOpenChange={(next) => setOpen(key, next)} className="day-collapsible">
              <TimelineTitle render={<h2 />} className="day-title">
                <CollapsibleTrigger
                  className="day-trigger"
                  aria-keyshortcuts={hint.ariaKeyshortcuts}
                  title={`${open ? "Collapse" : "Expand"} (${hint.text.replace(/[\u2066-\u2069]/g, "")})`}
                >
                  <time dateTime={key}>{dayFormat.format(first)}</time>
                  <ChevronDownIcon />
                </CollapsibleTrigger>
              </TimelineTitle>
              <TimelineDescription className="day-total text-sm tabular-nums text-(--ui-muted-foreground)">
                {formatDuration(dayEntries.reduce((sum, entry) => sum + durationOf(entry, now), 0))}
                <span className="sr-only"> tracked</span>
                {open ? null : (
                  <span className="sr-only">
                    , {dayEntries.length} {dayEntries.length === 1 ? "entry" : "entries"} hidden
                  </span>
                )}
              </TimelineDescription>
              <CollapsiblePanel className="day-panel">
                <ul className="day-entries">
                  {dayEntries.map((entry) => (
                    <li key={entry.id} className="border-b border-(--ui-border) last:border-b-0">
                      {entry.endedAt === null ? (
                        // The running timer is edited on its card, so its row only shows it.
                        <div className="entry-row" data-running="" data-entry-id={entry.id}>
                          <RowContent entry={entry} byId={byId} now={now} />
                        </div>
                      ) : (
                        // The whole row opens the entry. Its name is the entry, so the content stays visible text.
                        <Button
                          className="entry-row"
                          data-entry-id={entry.id}
                          aria-label={`Edit ${entryName(entry)}`}
                          onClick={() => onOpen(entry)}
                        >
                          <RowContent entry={entry} byId={byId} now={now} />
                        </Button>
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

export { EntryList, entryName }
