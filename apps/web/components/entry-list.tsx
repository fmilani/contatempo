"use client"

import { Button } from "@ui-sdk/react/button"
import type { Entry, Label } from "@/lib/api"
import { dateKey, durationOf, formatDuration } from "@/lib/time"
import { LabelDot } from "./label-picker"

type EntryListProps = {
  entries: Entry[]
  labels: Label[]
  onOpen: (entry: Entry) => void
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

function entryName(entry: Entry) {
  const start = new Date(entry.startedAt)
  return `${entry.description || "entry"} at ${timeFormat.format(start)}, ${dayFormat.format(start)}`
}

function EntryList({ entries, labels, onOpen }: EntryListProps) {
  const byId = new Map(labels.map((label) => [label.id, label]))
  const days = new Map<string, Entry[]>()
  for (const entry of entries) {
    const key = dateKey(new Date(entry.startedAt))
    days.set(key, [...(days.get(key) ?? []), entry])
  }

  return (
    <div className="flex flex-col gap-6">
      {[...days].map(([key, dayEntries]) => {
        const first = new Date(dayEntries[0].startedAt)
        return (
          <section key={key} aria-labelledby={`day-${key}`}>
            <div className="flex items-baseline justify-between border-b border-(--ui-border) pb-1.5">
              <h2 id={`day-${key}`} className="font-medium">
                {dayFormat.format(first)}
              </h2>
              <span className="text-sm tabular-nums text-(--ui-muted-foreground)">
                {formatDuration(dayEntries.reduce((sum, entry) => sum + durationOf(entry), 0))}
              </span>
            </div>
            <ul>
              {dayEntries.map((entry) => (
                <li key={entry.id} className="border-b border-(--ui-border)">
                  {/* The whole row opens the entry. Its name is the entry, so the content stays visible text. */}
                  <Button
                    className="entry-row"
                    data-entry-id={entry.id}
                    aria-label={`Edit ${entryName(entry)}`}
                    onClick={() => onOpen(entry)}
                  >
                    <span className="min-w-0 flex-1 basis-full text-start sm:basis-48">
                      <span
                        className={
                          entry.description
                            ? "block truncate"
                            : "block text-(--ui-muted-foreground)"
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
                    <span className="text-sm tabular-nums text-(--ui-muted-foreground)">
                      {timeFormat.format(new Date(entry.startedAt))} –{" "}
                      {entry.endedAt ? timeFormat.format(new Date(entry.endedAt)) : "now"}
                    </span>
                    <span className="ms-auto w-16 text-end font-medium tabular-nums sm:ms-0">
                      {formatDuration(durationOf(entry))}
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

export { EntryList, entryName }
