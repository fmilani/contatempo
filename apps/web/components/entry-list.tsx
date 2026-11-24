"use client"

import { Button } from "@ui-sdk/react/button"
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

  return (
    // One point per day, with that day's entries under it. Arrow keys move between days, and Tab
    // goes from a day into its entries.
    <Timeline aria-label="Entries by day" className="day-timeline">
      {[...days].map(([key, dayEntries]) => {
        const first = new Date(dayEntries[0].startedAt)
        return (
          <TimelineItem key={key} value={key} className="day-item" data-day={key}>
            <TimelineMarker />
            <TimelineConnector />
            <TimelineTitle render={<h2 />} className="font-medium">
              <time dateTime={key}>{dayFormat.format(first)}</time>
            </TimelineTitle>
            <TimelineDescription className="day-total text-sm tabular-nums text-(--ui-muted-foreground)">
              {formatDuration(dayEntries.reduce((sum, entry) => sum + durationOf(entry, now), 0))}
              <span className="sr-only"> tracked</span>
            </TimelineDescription>
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
          </TimelineItem>
        )
      })}
    </Timeline>
  )
}

export { EntryList, entryName }
