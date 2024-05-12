"use client"

import React, { useState } from "react"
import { Tag as TagIcon } from "lucide-react"
import {
  Command,
  CommandList,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { Tag } from "@/lib/api"
import { Checkbox } from "./ui/checkbox"

export function TagFilter({ tags }: { tags: Tag[] }) {
  const searchParams = useSearchParams()
  const filteredTags = searchParams?.getAll("tags") || []
  const [selected, setSelected] = useState<string[]>(filteredTags)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setSelected(filteredTags)
        setOpen(open)
      }}
    >
      <PopoverTrigger>
        <Badge
          id="date"
          variant="secondary"
          className={cn(
            "font-normal",
            selected.length === 0 && "text-muted-foreground",
          )}
        >
          <TagIcon className="mr-2 h-4 w-4" />
          {filteredTags
            .filter((s) => tags.find((t) => t.value === s))
            .join(", ")}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command
          label="Tags"
          filter={(value, search) => {
            const tag = tags.find((t) => t.id === value)
            if (tag?.value.toLowerCase().includes(search.toLowerCase())) {
              return 1
            } else if (
              value === "new-tag" &&
              !tags.find(
                (t) => t.value.toLowerCase() === search.toLowerCase().trim(),
              )
            ) {
              return 1
            }
            return 0
          }}
        >
          <CommandInput />
          <CommandList>
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                value={tag.id}
                onSelect={() => {
                  const index = selected.indexOf(tag.value)
                  if (index === -1) {
                    setSelected([...selected, tag.value])
                  } else {
                    setSelected(selected.toSpliced(index, 1))
                  }
                }}
                className="gap-2"
              >
                <Checkbox checked={selected.indexOf(tag.value) !== -1} />
                {tag.value}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
        <div className="flex justify-center pb-3 gap-4">
          <Button
            onClick={() => {
              setOpen(false)
            }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              const params = new URLSearchParams(searchParams?.toString())
              params.delete("tags")
              selected.forEach((tag) => {
                params.append("tags", tag)
              })
              router.push(`/records?${params}`)
              setOpen(false)
            }}
          >
            Filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
