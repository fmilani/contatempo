"use client"

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxCreate,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxList,
  ComboboxValue,
} from "@ui-sdk/react/combobox"
import { useEffect, useRef, useState } from "react"
import type { Label } from "@/lib/api"
import { PlusIcon, XIcon } from "./icons"

type LabelPickerProps = {
  name: string
  hideName?: boolean
  placeholder: string
  labels: Label[]
  value: string[]
  onValueChange: (value: string[]) => void
  onCreate?: (name: string) => Promise<Label>
}

function LabelDot({ color }: { color: string }) {
  return (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
  )
}

function LabelPicker({
  name,
  hideName,
  placeholder,
  labels,
  value,
  onValueChange,
  onCreate,
}: LabelPickerProps) {
  const byId = new Map(labels.map((label) => [label.id, label]))
  const latestValue = useRef(value)
  useEffect(() => {
    latestValue.current = value
  }, [value])

  return (
    <Combobox
      multiple
      value={value}
      onValueChange={(next) => onValueChange(next as string[])}
      itemToLabel={(id) => byId.get(id as string)?.name ?? ""}
    >
      <div className="flex min-w-0 flex-col gap-1.5">
        <ComboboxLabel className={hideName ? "sr-only" : undefined}>{name}</ComboboxLabel>
        <ComboboxChips className="label-chips">
          <ComboboxValue>
            {(state) =>
              (state.value as string[]).map((id) => (
                <ComboboxChip key={id} value={id} className="label-chip">
                  <LabelDot color={byId.get(id)?.color ?? "transparent"} />
                  {byId.get(id)?.name}
                  <ComboboxChipRemove
                    aria-label={`Remove ${byId.get(id)?.name}`}
                    className="label-chip-remove"
                  >
                    <XIcon />
                  </ComboboxChipRemove>
                </ComboboxChip>
              ))
            }
          </ComboboxValue>
          <ComboboxInput placeholder={value.length === 0 ? placeholder : ""} />
        </ComboboxChips>
      </div>
      <ComboboxContent>
        {onCreate ? null : <ComboboxEmpty>No labels found.</ComboboxEmpty>}
        <ComboboxList>
          {labels.map((label) => (
            <ComboboxItem key={label.id} value={label.id} label={label.name}>
              <LabelDot color={label.color} />
              {label.name}
              <ComboboxItemIndicator />
            </ComboboxItem>
          ))}
          {onCreate ? (
            <ComboboxCreate
              minLength={1}
              className="label-create"
              onCreate={async (query) => {
                const label = await onCreate(query.trim())
                onValueChange([...new Set([...latestValue.current, label.id])])
              }}
            >
              {(state) => (
                <>
                  <PlusIcon />
                  <span>
                    {state.pending ? "Creating" : "Create"} “{state.query.trim()}”
                    {state.error ? (
                      <span className="block text-(--ui-destructive)">
                        {(state.error as Error).message}
                      </span>
                    ) : null}
                  </span>
                </>
              )}
            </ComboboxCreate>
          ) : null}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

// Wraps a label-creating function and reports whether a creation is still running,
// so a form can wait for the label before it submits. The ref answers within the
// same event, before the state has rendered.
function usePendingCreate(create: (name: string) => Promise<Label>) {
  const running = useRef(0)
  const [pending, setPending] = useState(false)
  async function tracked(name: string) {
    running.current += 1
    setPending(true)
    try {
      return await create(name)
    } finally {
      running.current -= 1
      setPending(running.current > 0)
    }
  }
  return { create: tracked, pending, isPending: () => running.current > 0 }
}

export { LabelDot, LabelPicker, usePendingCreate }
