import type { Label } from "./api"

// A description is text with labels in it, each saved as `#<label:id>`, so a label keeps its
// place in the text and a rename shows everywhere. The entry's labels are the ones in it.
const LABEL = /#<label:([\w-]+)>/g

export const labelToken = (id: string) => `#<label:${id}>`

export type DescriptionPart = string | { labelId: string }

// The text and the labels in it, in order.
export function descriptionParts(description: string): DescriptionPart[] {
  const parts: DescriptionPart[] = []
  let last = 0
  for (const match of description.matchAll(LABEL)) {
    if (match.index > last) parts.push(description.slice(last, match.index))
    parts.push({ labelId: match[1] })
    last = match.index + match[0].length
  }
  if (last < description.length) parts.push(description.slice(last))
  return parts
}

// The ids of the labels in a description, each once, in the order they first appear. Only labels
// that exist count: one that's gone stays in the text, shown as unknown, but isn't linked, which
// the server would refuse.
export function labelIdsIn(description: string, labels: readonly Label[]): string[] {
  const known = new Set(labels.map((label) => label.id))
  const ids = [...description.matchAll(LABEL)].map((match) => match[1])
  return [...new Set(ids)].filter((id) => known.has(id))
}

// What's saved: one line, with runs of spaces and line breaks made single spaces.
export function normalizeDescription(text: string) {
  return text.replace(/\s+/g, " ").trim()
}

// A description as people read it, with each label as #name, for names and announcements.
export function readableDescription(description: string, byId: Map<string, Label>) {
  return description.replace(LABEL, (_, id: string) => `#${byId.get(id)?.name ?? "unknown label"}`)
}

// Whether a description has nothing to show, neither words nor labels.
export const isBlank = (description: string) => description.trim() === ""
