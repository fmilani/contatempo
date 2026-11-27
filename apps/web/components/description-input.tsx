"use client"

import {
  TokenInput,
  TokenInputEditor,
  TokenInputToken,
  TokenInputTokenRemove,
  createTokenInputController,
  fromText,
  toText,
  type Token,
  type TokenCodec,
  type TokenInputValue,
} from "@ui-sdk/react/token-input"
import {
  TriggerMenu,
  TriggerMenuContent,
  TriggerMenuEmpty,
  TriggerMenuItem,
  TriggerMenuList,
  createTriggerMenuController,
  type TriggerMenuDataItem,
} from "@ui-sdk/react/trigger-menu"
import { useEffect, useState, type FocusEvent, type KeyboardEvent, type Ref } from "react"
import type { Label } from "@/lib/api"
import { descriptionParts, labelToken } from "@/lib/description"
import { PlusIcon, XIcon } from "./icons"
import { LabelDot } from "./label-picker"

// The database keeps descriptions to 500 characters, each label taking about 45 of them.
export const DESCRIPTION_LIMIT = 500

const CREATE = "create:"

// Turns `#<label:id>` into a label token and back. A label that's gone shows as unknown.
function labelCodec(byId: Map<string, Label>): TokenCodec {
  return {
    format: (token) => labelToken(token.value),
    parse: (text) =>
      text
        .split(/(#<label:[\w-]+>)/)
        .filter(Boolean)
        .map((part) => {
          const id = /^#<label:([\w-]+)>$/.exec(part)?.[1]
          if (!id) return part
          const label = byId.get(id)
          return {
            type: "label",
            value: id,
            label: label?.name ?? "unknown label",
            data: { color: label?.color },
          }
        }),
  }
}

type DescriptionInputProps = {
  // The description it starts with. It's read once: the input keeps what's typed after that.
  defaultValue: string
  labels: Label[]
  onCreateLabel: (name: string) => Label
  onValueChange?: (description: string) => void
  // Enter, unless the label menu is open or an input method is composing.
  onSubmit?: (description: string) => void
  // Escape, unless the label menu is open: then Escape only closes the menu.
  onEscape?: () => void
  onBlur?: (event: FocusEvent<HTMLDivElement>) => void
  editorRef?: Ref<HTMLDivElement>
  // Focuses the editor once it's on the page, with the caret after the text.
  focusAtEnd?: boolean
  className?: string
  placeholder?: string
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-invalid"?: boolean
}

// A description with labels in it: # opens a menu of labels, narrowed as you type, with Create
// at the end when none has that name. Choosing one puts the label in the text as a chip. Text
// that's only typed, like #12, stays text. The value is the description as saved.
function DescriptionInput({
  defaultValue,
  labels,
  onCreateLabel,
  onValueChange,
  onSubmit,
  onEscape,
  onBlur,
  editorRef,
  focusAtEnd = false,
  className,
  placeholder,
  ...aria
}: DescriptionInputProps) {
  const byId = new Map(labels.map((label) => [label.id, label]))
  const codec = labelCodec(byId)
  const [value, setValue] = useState<TokenInputValue>(() => fromText(defaultValue, codec))
  const [menu] = useState(createTriggerMenuController)
  const [editor] = useState(createTokenInputController)
  // What's typed after #. The options are worked out from it as it's typed, not loaded after a
  // pause, so a quick # name Enter still picks the label.
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (focusAtEnd) editor.focus({ at: "end" })
  }, [focusAtEnd, editor])

  // The labels whose names contain the query, and Create when none is named that exactly.
  function itemsFor(query: string): TriggerMenuDataItem[] {
    const name = query.trim()
    const lower = name.toLowerCase()
    const items: TriggerMenuDataItem[] = labels
      .filter((label) => label.name.toLowerCase().includes(lower))
      .map((label) => ({ value: label.id, label: label.name }))
    if (name && !labels.some((label) => label.name.toLowerCase() === lower)) {
      items.push({ value: `${CREATE}${name}`, label: name })
    }
    return items
  }

  function tokenFor(item: TriggerMenuDataItem): Token {
    const chosen = String(item.value)
    const label = chosen.startsWith(CREATE)
      ? onCreateLabel(chosen.slice(CREATE.length))
      : byId.get(chosen)
    return {
      type: "label",
      value: label?.id ?? chosen,
      label: label?.name ?? item.label,
      data: { color: label?.color },
    }
  }

  return (
    <TokenInput
      controller={editor}
      codec={codec}
      copy="label"
      value={value}
      onValueChange={(next, details) => {
        const text = toText(next, codec)
        if (text.length > DESCRIPTION_LIMIT) return details.cancel()
        setValue(next)
        onValueChange?.(text)
      }}
      onSubmit={(next) => onSubmit?.(toText(next, codec))}
      getTokenDescription={() => "label"}
      renderToken={(token) => (
        <TokenInputToken className="desc-chip">
          <LabelDot color={(token.data?.color as string | undefined) ?? "transparent"} />
          {token.label}
          <TokenInputTokenRemove>
            <XIcon />
          </TokenInputTokenRemove>
        </TokenInputToken>
      )}
    >
      <TokenInputEditor
        ref={editorRef}
        className={className}
        placeholder={placeholder}
        aria-label={aria["aria-label"]}
        aria-labelledby={aria["aria-labelledby"]}
        aria-invalid={aria["aria-invalid"] || undefined}
        onBlur={onBlur}
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          // One line of text that wraps, so no line breaks.
          if (event.key === "Enter" && event.shiftKey) event.preventDefault()
          if (event.key === "Escape" && !menu.isOpen() && onEscape) {
            event.preventDefault()
            event.stopPropagation()
            onEscape()
          }
        }}
      />
      <TriggerMenu
        controller={menu}
        triggers={[{ char: "#", type: "label", filter: false }]}
        onQueryChange={setQuery}
      >
        <TriggerMenuContent className="label-menu">
          <TriggerMenuEmpty>Type a name to create a label.</TriggerMenuEmpty>
          <TriggerMenuList>
            {itemsFor(query).map((item) => {
              const create = String(item.value).startsWith(CREATE)
              const label = byId.get(String(item.value))
              return (
                <TriggerMenuItem
                  key={String(item.value)}
                  value={item.value}
                  label={item.label}
                  className={create ? "label-create" : undefined}
                  onSelect={(_, details) => details.insert(tokenFor(item))}
                >
                  {create ? <PlusIcon /> : <LabelDot color={label?.color ?? "transparent"} />}
                  {create ? `Create “${item.label}”` : item.label}
                </TriggerMenuItem>
              )
            })}
          </TriggerMenuList>
        </TriggerMenuContent>
      </TriggerMenu>
    </TokenInput>
  )
}

// A description as text, with its labels as chips in their places. It wraps.
function DescriptionText({ description, labels }: { description: string; labels: Map<string, Label> }) {
  return (
    <>
      {descriptionParts(description).map((part, index) => {
        if (typeof part === "string") return part
        const label = labels.get(part.labelId)
        return (
          <span key={index} className="desc-chip" data-unknown={label ? undefined : ""}>
            <LabelDot color={label?.color ?? "transparent"} />
            {label?.name ?? "unknown label"}
          </span>
        )
      })}
    </>
  )
}

export { DescriptionInput, DescriptionText }
