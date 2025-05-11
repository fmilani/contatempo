"use client"

import React, { useOptimistic, useState, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { Tag } from "@/lib/api"
import { Tag as TagIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cn } from "./lib/utils"
import { Command, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Checkbox } from "./ui/checkbox"
import { getTagColor } from "./RecordsList"

export function TagFilter({
  tags,
  tagsParam,
}: {
  tags: Tag[]
  tagsParam: string[]
}) {
  const searchParams = useSearchParams()
  console.log(tagsParam)
  const [optimisticTags, setOptimisticTags] = useOptimistic(tagsParam)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const filteringTags = tags
    .filter((tag) => optimisticTags.includes(tag.value))
    .sort((a, b) => a.value.localeCompare(b.value))
  return (
    <div className="flex flex-row">
      <Popover>
        <PopoverTrigger>
          <Badge variant="outline" className="font-normal space-x-2">
            <TagIcon className="h-4 w-4" />
            {optimisticTags.length === 0 ? (
              <span>Tags</span>
            ) : (
              <div className="flex items-center gap-1.5">
                {filteringTags.slice(0, 3).map((tag) => (
                  <div
                    className={cn("w-3 h-3 rounded-full", getTagColor(tag))}
                  />
                ))}
                <div>
                  {optimisticTags.length === 1
                    ? filteringTags[0].value
                    : filteringTags.length + "tags"}
                </div>
              </div>
            )}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
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
            <CommandInput placeholder="Search..." />
            <CommandList className="max-h-[300px]">
              {tags
                .sort((a, b) => a.value.localeCompare(b.value))
                .map((tag) => (
                  <CommandItem
                    className="cursor-pointer"
                    key={tag.id}
                    value={tag.id}
                    onSelect={() => {
                      const newFilteredTags = optimisticTags.includes(tag.value)
                        ? optimisticTags.filter((t) => t !== tag.value)
                        : [...optimisticTags, tag.value]
                      const params = new URLSearchParams(
                        searchParams?.toString(),
                      )
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
                    <div className="flex items-center gap-1.5">
                      <Checkbox
                        checked={optimisticTags.includes(tag.value)}
                        className="group-data-[selected=true]:opacity-100 dark:border-ring mr-1"
                      />
                      <div
                        className={cn("w-3 h-3 rounded-full", getTagColor(tag))}
                      />
                      <div>{tag.value}</div>
                    </div>
                  </CommandItem>
                ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
  // return (
  //   <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
  //     <CollapsibleTrigger>
  //       <Badge variant="secondary" className="font-normal space-x-2">
  //         <TagIcon className="h-4 w-4" />
  //         <span>Tags ({optimisticTags.length})</span>
  //         {(isOpen && <ChevronUp className="h-4 w-4" />) || (
  //           <ChevronDown className="h-4 w-4" />
  //         )}
  //       </Badge>
  //     </CollapsibleTrigger>
  //     <CollapsibleContent>
  //       <div className="flex flex-row gap-1 flex-wrap">
  //         {tags
  //           .sort((a, b) => {
  //             const aValue = a.value.toLowerCase()
  //             const bValue = b.value.toLowerCase()
  //             if (aValue > bValue) return 1
  //             if (bValue > aValue) return -1
  //             return 0
  //           })
  //           .map((tag) => {
  //             const tagSelected = optimisticTags.includes(tag.value)
  //             return (
  //               <button
  //                 key={tag.id}
  //                 className="flex min-w-fit"
  //                 onClick={() => {
  //                   const newFilteredTags = tagSelected
  //                     ? optimisticTags.filter((t) => t !== tag.value)
  //                     : [...optimisticTags, tag.value]
  //                   const params = new URLSearchParams(searchParams?.toString())
  //                   params.delete("tags")
  //                   newFilteredTags.forEach((tag) => {
  //                     params.append("tags", tag)
  //                   })
  //                   startTransition(() => {
  //                     setOptimisticTags(newFilteredTags)
  //                     router.push(`/records?${params}`)
  //                   })
  //                 }}
  //               >
  //                 <Badge
  //                   variant={tagSelected ? "default" : "secondary"}
  //                   className="font-normal"
  //                 >
  //                   {tag.value}
  //                 </Badge>
  //               </button>
  //             )
  //           })}
  //       </div>
  //     </CollapsibleContent>
  //   </Collapsible>
  // )
}
