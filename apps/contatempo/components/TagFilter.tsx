"use client"

import React, { useOptimistic, useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { Tag } from "@/lib/api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible"
import { Button } from "./ui/button"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Tag as TagIcon,
} from "lucide-react"

export function TagFilter({
  tags,
  tagsParam,
}: {
  tags: Tag[]
  tagsParam: string[]
}) {
  const searchParams = useSearchParams()
  const [optimisticTags, setOptimisticTags] = useOptimistic(tagsParam)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
      <CollapsibleTrigger>
        <Badge variant="secondary" className="font-normal space-x-2">
          <TagIcon className="h-4 w-4" />
          <span>Tags ({optimisticTags.length})</span>
          {(isOpen && <ChevronUp className="h-4 w-4" />) || (
            <ChevronDown className="h-4 w-4" />
          )}
        </Badge>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-row gap-1 flex-wrap">
          {tags.map((tag) => {
            const tagSelected = optimisticTags.includes(tag.value)
            return (
              <button
                key={tag.id}
                className="flex min-w-fit"
                onClick={() => {
                  const newFilteredTags = tagSelected
                    ? optimisticTags.filter((t) => t !== tag.value)
                    : [...optimisticTags, tag.value]
                  const params = new URLSearchParams(searchParams?.toString())
                  params.delete("tags")
                  newFilteredTags.forEach((tag) => {
                    params.append("tags", tag)
                  })
                  startTransition(() => {
                    setOptimisticTags(newFilteredTags)
                    router.push(`/records?${params}`)
                  })
                }}
              >
                <Badge
                  variant={tagSelected ? "default" : "secondary"}
                  className="font-normal"
                >
                  {tag.value}
                </Badge>
              </button>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
