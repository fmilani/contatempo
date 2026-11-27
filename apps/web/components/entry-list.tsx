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
import {
  isBlank,
  labelIdsIn,
  normalizeDescription,
  readableDescription,
} from "@/lib/description"
import { DescriptionInput, DescriptionText } from "./description-input"
import { ChevronDownIcon, CollapseAllIcon, ExpandAllIcon, TrashIcon } from "./icons"

type EntryListProps = {
  entries: Entry[]
  labels: Label[]
  // Saves an entry changed in its row: its times or its description. Without it the rows only show.
  onSave?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
  onCreateLabel?: (name: string) => Label
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

// How an entry is named to screen readers and agents: its description, with labels as #name.
function entryName(entry: Entry, labels: Map<string, Label> = new Map()) {
  const start = new Date(entry.startedAt)
  const description = readableDescription(entry.description, labels).trim()
  return `${description || "entry"} at ${timeFormat.format(start)}, ${dayFormat.format(start)}`
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

// The times typed so far. A time not touched yet is missing; one partly typed is null. Either
// way it keeps its saved time, read when saving, so a save made meanwhile isn't undone.
type Draft = Partial<Record<Edge, string | null>>
type Editing = {
  edge: Edge
  draft: Draft
  // Tab or a press went from one time to the other: the two are one edit, checked and saved
  // together.
  linked: boolean
  // Which part of the input takes focus: the first coming forward, the last coming back.
  focus: "first" | "last"
  // The button's width, which the input takes so nothing around it moves.
  width: number
}

// A finished entry's start and end: text that turns into a time input in place when pressed.
// Enter, leaving or Tab out saves; Escape puts the times back. Tab from the start, or pressing
// the other time while one is open (phones have no Tab), goes straight into editing it, and the
// two save together once done, so an entry can move past its old end. An end before the start
// isn't saved: the input stays open, marked.
function EditableTimes({
  entry,
  byId,
  onSave,
}: {
  entry: Entry
  byId: Map<string, Label>
  onSave: (entry: Entry) => void
}) {
  const endedAt = entry.endedAt as string
  const saved = { start: toClock(entry.startedAt), end: toClock(endedAt) }
  const [editing, setEditing] = useState<Editing | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [controller] = useState(createTimeInputController)
  const timesRef = useRef<HTMLSpanElement>(null)
  const startButton = useRef<HTMLButtonElement>(null)
  const endButton = useRef<HTMLButtonElement>(null)
  // The button to focus once the input closes, when the keyboard closed it.
  const refocus = useRef<Edge | null>(null)
  // Set while focus moves on purpose from one input to the other, or the edit closes, so a blur
  // fired as an input goes away doesn't save again.
  const switching = useRef(false)
  // Set from pressing the other time until its click, which switches to it. A press that ends
  // without a click, like a drag off it, leaves the edit as any other press elsewhere would.
  const pressing = useRef(false)

  const editingEdge = editing?.edge ?? null
  const focusAt = editing?.focus
  useEffect(() => {
    if (editingEdge) {
      const parts = timesRef.current?.querySelectorAll<HTMLElement>('[role="spinbutton"]')
      if (focusAt === "last" && parts?.length) parts[parts.length - 1].focus()
      else controller.focus()
      switching.current = false
    } else if (refocus.current) {
      ;(refocus.current === "start" ? startButton : endButton).current?.focus()
      refocus.current = null
    }
  }, [editingEdge, focusAt, controller])

  const button = (edge: Edge) => (edge === "start" ? startButton : endButton).current
  const widthOf = (edge: Edge) => button(edge)?.getBoundingClientRect().width ?? 0

  // The entry the draft makes, using the saved time for a part left partly typed.
  function draftEntry(draft: Draft): Entry {
    return {
      ...entry,
      startedAt:
        draft.start && draft.start !== saved.start
          ? withClock(entry.startedAt, draft.start)
          : entry.startedAt,
      endedAt: draft.end && draft.end !== saved.end ? withClock(endedAt, draft.end) : endedAt,
    }
  }

  function close(focusBack: Edge | null) {
    switching.current = true
    refocus.current = focusBack
    setEditing(null)
    setInvalid(false)
  }

  // Whether the draft can be saved: false, and marked, when the end is before the start.
  function valid(): boolean {
    if (!editing) return true
    const next = draftEntry(editing.draft)
    const ok = Date.parse(next.endedAt as string) >= Date.parse(next.startedAt)
    if (!ok) setInvalid(true)
    return ok
  }

  // Saves the draft, when it's valid and changed something. False when it isn't valid.
  function finish(): boolean {
    if (!editing || !valid()) return false
    const next = draftEntry(editing.draft)
    if (next.startedAt !== entry.startedAt || next.endedAt !== entry.endedAt) onSave(next)
    return true
  }

  function moveTo(edge: Edge, focus: Editing["focus"]) {
    switching.current = true
    setInvalid(false)
    setEditing((current) => current && { ...current, edge, linked: true, focus, width: widthOf(edge) })
  }

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!editing) return
    if (event.key === "Enter") {
      event.preventDefault()
      if (finish()) close(editing.edge)
    } else if (event.key === "Escape") {
      // The whole edit is canceled, both times, and only it: not a dialog around it.
      event.preventDefault()
      event.stopPropagation()
      close(editing.edge)
    } else if (event.key === "Tab") {
      const parts = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="spinbutton"]')]
      const first = event.target === parts[0]
      const last = event.target === parts[parts.length - 1]
      if (!event.shiftKey && last && editing.edge === "start") {
        event.preventDefault()
        moveTo("end", "first")
      } else if (event.shiftKey && first && editing.edge === "end" && editing.linked) {
        event.preventDefault()
        moveTo("start", "last")
      } else if ((event.shiftKey ? first : last) && !valid()) {
        // Leaving with an end before the start: stay, so it can be fixed.
        event.preventDefault()
      }
      // Otherwise Tab moves on as usual, inside the input or out of it, and leaving saves.
    }
  }

  function onBlur(event: FocusEvent<HTMLElement>) {
    // Moving between the hour and minute stays inside.
    if (switching.current || event.currentTarget.contains(event.relatedTarget as Node | null)) return
    // Leaving saves, or drops a bad time.
    finish()
    close(null)
  }

  function slot(edge: Edge) {
    if (editing?.edge === edge) {
      return (
        <TimeInput
          controller={controller}
          className="entry-time-edit"
          style={{ width: editing.width }}
          aria-label={`${edge === "start" ? "Start" : "End"} time of ${entryName(entry, byId)}`}
          aria-invalid={invalid || undefined}
          data-bad={invalid ? "" : undefined}
          title={invalid ? "The end can't be before the start" : undefined}
          locale={rowTimeOptions.locale}
          hourCycle={rowHourCycle}
          value={edge in editing.draft ? (editing.draft[edge] ?? null) : saved[edge]}
          onValueChange={(value) => {
            setInvalid(false)
            setEditing((current) => current && { ...current, draft: { ...current.draft, [edge]: value } })
          }}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      )
    }
    // Pressing the other time while one is open: its input's blur, which comes first, mustn't
    // save, as the click goes on to edit this one too.
    const otherOpen = editing !== null
    // The other time shows what was typed in it, while the two are one edit.
    const shownEntry = draftEntry(editing?.draft ?? {})
    const iso = edge === "start" ? shownEntry.startedAt : shownEntry.endedAt
    const shown = rowTimeFormat.format(new Date(iso as string))
    return (
      <button
        ref={edge === "start" ? startButton : endButton}
        type="button"
        className="entry-time"
        aria-label={
          edge === "start"
            ? `Change start time of ${entryName(entry, byId)}`
            : `Change end time of ${entryName(entry, byId)}, ended ${shown}`
        }
        onPointerDown={() => {
          if (!otherOpen) return
          pressing.current = true
          switching.current = true
          // Phones send the click a little after the touch ends, so wait for it rather than a
          // time. A click elsewhere, after a drag off, or a canceled touch, like a scroll, ends
          // the edit as a press elsewhere would. A click here switches first, in onClick.
          const settle = () => {
            document.removeEventListener("click", settle, true)
            document.removeEventListener("pointercancel", settle, true)
            setTimeout(() => {
              if (!pressing.current) return
              pressing.current = false
              switching.current = false
              finish()
              close(null)
            })
          }
          document.addEventListener("click", settle, true)
          document.addEventListener("pointercancel", settle, true)
        }}
        onClick={(event) => {
          if (editing) {
            pressing.current = false
            moveTo(edge, "first")
            return
          }
          setInvalid(false)
          setEditing({
            edge,
            draft: {},
            linked: false,
            focus: "first",
            width: event.currentTarget.getBoundingClientRect().width,
          })
        }}
      >
        {shown}
      </button>
    )
  }

  return (
    // tabular-nums gives every digit the same width, so times and durations line up across rows.
    <span ref={timesRef} className="entry-times tabular-nums text-sm text-(--ui-muted-foreground)">
      {slot("start")}
      <span className="entry-dash">–</span>
      {slot("end")}
    </span>
  )
}

function RowTimes({
  entry,
  byId,
  onSave,
}: {
  entry: Entry
  byId: Map<string, Label>
  onSave?: (entry: Entry) => void
}) {
  if (entry.endedAt && onSave) return <EditableTimes entry={entry} byId={byId} onSave={onSave} />
  return (
    <span className="entry-times tabular-nums text-sm text-(--ui-muted-foreground)">
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
    </span>
  )
}

// A finished entry's description, with its labels as chips in their places. It's a button that
// hugs the words; pressed, it becomes the description input in the same place, where # adds a
// label. Enter or leaving saves, along with the labels in it; Escape puts it back.
function EditableDescription({
  entry,
  labels,
  byId,
  onSave,
  onCreateLabel,
}: {
  entry: Entry
  labels: Label[]
  byId: Map<string, Label>
  onSave: (entry: Entry) => void
  onCreateLabel: (name: string) => Label
}) {
  const [editing, setEditing] = useState(false)
  // The text's height when it was pressed. The editor fills in a moment after it appears, and
  // keeping this height meanwhile stops the row shrinking, which would scroll the page.
  const [height, setHeight] = useState<number | undefined>()
  const latest = useRef(entry.description)
  const editorRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  // Whether to focus the button once the input closes: when the keyboard closed it.
  const refocus = useRef(false)
  // Set once the input closes, so a blur fired as it goes away doesn't save again.
  const closed = useRef(false)

  // The editor focuses itself when it opens, with the caret after the text; this puts focus back
  // on the button when the keyboard closed it.
  useEffect(() => {
    if (!editing && refocus.current) {
      refocus.current = false
      buttonRef.current?.focus()
    }
  }, [editing])

  function close(focusBack: boolean) {
    closed.current = true
    refocus.current = focusBack
    setEditing(false)
  }

  function save() {
    const description = normalizeDescription(latest.current)
    if (description !== entry.description) {
      onSave({ ...entry, description, labelIds: labelIdsIn(description, labels) })
    }
  }

  if (editing) {
    return (
      <div className="entry-desc-edit" style={{ minHeight: height }}>
        <DescriptionInput
          editorRef={editorRef}
          focusAtEnd
          className="description-editor"
          aria-label={`Description of ${entryName(entry, byId)}`}
          placeholder="No description. Type # for labels"
          defaultValue={entry.description}
          labels={labels}
          onCreateLabel={onCreateLabel}
          onValueChange={(value) => (latest.current = value)}
          onSubmit={() => {
            save()
            close(true)
          }}
          onEscape={() => close(true)}
          onBlur={(event) => {
            // The label menu and its items keep the edit going.
            const next = event.relatedTarget as Node | null
            if (closed.current || event.currentTarget.parentElement?.contains(next)) return
            save()
            close(false)
          }}
        />
      </div>
    )
  }

  return (
    <Button
      ref={buttonRef}
      className="entry-desc"
      data-empty={isBlank(entry.description) ? "" : undefined}
      aria-label={`Change description of ${entryName(entry, byId)}`}
      onClick={(event) => {
        setHeight(event.currentTarget.getBoundingClientRect().height)
        closed.current = false
        latest.current = entry.description
        setEditing(true)
      }}
    >
      {isBlank(entry.description) ? (
        "No description"
      ) : (
        <DescriptionText description={entry.description} labels={byId} />
      )}
    </Button>
  )
}

// The description and duration of a row that only shows, like the running one.
function RowContent({
  entry,
  byId,
  now,
  editable = false,
}: {
  entry: Entry
  byId: Map<string, Label>
  now?: number
  // The description sits on top of the row, as its own button: this keeps its column.
  editable?: boolean
}) {
  return (
    <>
      {editable ? null : (
        <span
          className={`entry-main ${isBlank(entry.description) ? "text-(--ui-muted-foreground)" : ""}`}
        >
          {isBlank(entry.description) ? (
            "No description"
          ) : (
            <DescriptionText description={entry.description} labels={byId} />
          )}
        </span>
      )}
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

function EntryList({
  entries,
  labels,
  onSave,
  onDelete,
  onCreateLabel,
  now,
  collapse: shared,
}: EntryListProps) {
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
                      {entry.endedAt === null || !onSave || !onCreateLabel ? (
                        // The running timer is edited on its card, so its row only shows it.
                        <div
                          className="entry-row"
                          data-running={entry.endedAt === null ? "" : undefined}
                          data-entry-id={entry.id}
                        >
                          <RowContent entry={entry} byId={byId} now={now} />
                          <RowTimes entry={entry} byId={byId} />
                        </div>
                      ) : (
                        // The times and the description are buttons that edit in place, and the
                        // trash at the end deletes. The rest of the row does nothing.
                        <div className="entry-row" data-entry-id={entry.id}>
                          <RowContent entry={entry} byId={byId} now={now} editable />
                          <RowTimes entry={entry} byId={byId} onSave={onSave} />
                          <EditableDescription
                            entry={entry}
                            labels={labels}
                            byId={byId}
                            onSave={onSave}
                            onCreateLabel={onCreateLabel}
                          />
                          {onDelete ? (
                            <Button
                              className="entry-delete"
                              aria-label={`Delete ${entryName(entry, byId)}`}
                              data-agent-confirm={`Deletes the entry ${entryName(entry, byId)}`}
                              onClick={() => onDelete(entry)}
                            >
                              <TrashIcon />
                            </Button>
                          ) : null}
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
