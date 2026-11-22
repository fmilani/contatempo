import type { Entry, Label } from "@/lib/api"
import { durationOf, formatDuration } from "@/lib/time"
import { LabelDot } from "./label-picker"

// `now` is where a running entry's time ends, so the totals keep counting while it runs.
function Summary({ entries, labels, now }: { entries: Entry[]; labels: Label[]; now?: number }) {
  const total = entries.reduce((sum, entry) => sum + durationOf(entry, now), 0)
  const perLabel = labels
    .map((label) => ({
      label,
      total: entries
        .filter((entry) => entry.labelIds.includes(label.id))
        .reduce((sum, entry) => sum + durationOf(entry, now), 0),
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total)
  const unlabeled = entries
    .filter((entry) => entry.labelIds.length === 0)
    .reduce((sum, entry) => sum + durationOf(entry, now), 0)

  return (
    <section aria-label="Summary" className="card flex flex-wrap items-start gap-x-10 gap-y-4">
      <div>
        <h2 className="text-sm text-(--ui-muted-foreground)">Total tracked</h2>
        <p className="text-3xl font-semibold tabular-nums">{formatDuration(total)}</p>
        <p className="text-sm text-(--ui-muted-foreground)">
          {entries.length} {entries.length === 1 ? "entry" : "entries"}
        </p>
      </div>
      {perLabel.length > 0 || unlabeled > 0 ? (
        <div className="min-w-48 flex-1">
          <h2 className="text-sm text-(--ui-muted-foreground)">By label</h2>
          <ul aria-label="Time by label" className="mt-1 grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {perLabel.map(({ label, total }) => (
              <li key={label.id} className="flex items-center gap-2">
                <LabelDot color={label.color} />
                <span className="min-w-0 flex-1 truncate">{label.name}</span>
                <span className="tabular-nums">{formatDuration(total)}</span>
              </li>
            ))}
            {unlabeled > 0 ? (
              <li className="flex items-center gap-2 text-(--ui-muted-foreground)">
                <span className="size-2.5 shrink-0 rounded-full border border-current" />
                <span className="flex-1">No label</span>
                <span className="tabular-nums">{formatDuration(unlabeled)}</span>
              </li>
            ) : null}
          </ul>
          {perLabel.length > 1 ? (
            <p className="mt-2 text-xs text-(--ui-muted-foreground)">
              An entry with several labels counts toward each of them.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

export { Summary }
