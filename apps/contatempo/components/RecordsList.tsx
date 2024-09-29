"use client"

import React, { useOptimistic, useState } from "react"
import { formatInTimeZone } from "date-fns-tz"
import { X } from "lucide-react"
import { Record, Tag } from "@/lib/api"
import locale from "date-fns/locale/en-US"
import Duration from "@/components/Duration"
import { differenceInCalendarDays, formatRelative } from "date-fns"
import CurrentRecord from "@/components/CurrentRecord"
import useInterval from "@/lib/hooks/useInterval"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandList,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { addTagToRecord, deleteRecord, removeTagFromRecord } from "../actions"
import { useForm } from "react-hook-form"
import { Form } from "./ui/form"
import { useCommandState } from "cmdk"
import isWithinInterval from "date-fns/isWithinInterval"
import { useSearchParams } from "next/navigation"
import parse from "date-fns/parse"
import endOfDay from "date-fns/endOfDay"

export default function RecordsList({ records, tags }) {
  const [now, setNow] = useState<Date>(new Date())
  useInterval(() => setNow(new Date()), 500)
  const [optmisticRecords, setOptimisticRecords] = useOptimistic(
    records,
    (state: any, { action, newRecord, tag, time }: any) => {
      if (action === "add_tag") {
        return state.map((record: Record) =>
          record.id === newRecord.id
            ? {
                ...record,
                isSaving: true,
                tags: [...record.tags, tag],
              }
            : record,
        )
      } else if (action === "remove_tag") {
        return state.map((record: Record) =>
          record.id === newRecord.id
            ? {
                ...record,
                isSaving: true,
                tags: record.tags.filter((t) => t.id !== tag.id),
              }
            : record,
        )
      } else if (action === "delete") {
        return state.filter((record: Record) => record.id !== newRecord.id)
      } else {
        if (newRecord) {
          return state.map((record: Record) =>
            record.id === newRecord.id
              ? { ...record, end: time.toISOString(), isSaving: true }
              : record,
          )
        } else {
          return [
            {
              id: "optmistic-new-record",
              begin: time.toISOString(),
              tags: [],
              isSaving: true,
            },
            ...state,
          ]
        }
      }
    },
  )
  const searchParams = useSearchParams()
  const todayInRange = isWithinInterval(now, {
    start: parse(searchParams?.get("from") ?? "", "yyyy-MM-dd", new Date()),
    end: endOfDay(
      parse(searchParams?.get("to") ?? "", "yyyy-MM-dd", new Date()),
    ),
  })
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-3xl flex justify-between">
            Total
            <Duration records={optmisticRecords} now={now} />
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="space-y-2">
        {todayInRange && (
          <CurrentRecord
            record={optmisticRecords.find((record: Record) => !record.end)}
            now={now}
            setOptimisticRecords={setOptimisticRecords}
          />
        )}
        <div className="space-y-2">
          {Object.entries(groupRecords(optmisticRecords)).map(
            ([day, recordsOfDay]) => (
              <Card key={day} className="shadow-none border-none">
                <CardHeader className="py-4 px-2">
                  <CardTitle className="text-xl flex justify-between">
                    <span>
                      {differenceInCalendarDays(
                        new Date(),
                        new Date(recordsOfDay[0].begin),
                      ) > 1
                        ? capitalize(
                            formatInTimeZone(
                              new Date(recordsOfDay[0].begin),
                              "America/Sao_Paulo",
                              "eeee, MMM dd",
                              { locale },
                            ),
                          )
                        : `${capitalize(
                            formatRelative(
                              new Date(recordsOfDay[0].begin),
                              new Date(),
                              {
                                locale,
                              },
                            ).split(" ")[0],
                          )}, ${formatInTimeZone(
                            new Date(recordsOfDay[0].begin),
                            "America/Sao_Paulo",
                            "MMM dd",
                            { locale },
                          )}`}
                    </span>
                    <span>
                      <Duration records={recordsOfDay} now={now} />
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pb-4">
                  <ul>
                    {recordsOfDay.map((record) => (
                      <li
                        key={record.id}
                        className={cn(
                          (record as any).isSaving && "animate-pulse",
                          "last:mb-0 mb-1",
                        )}
                      >
                        <RecordDetails
                          record={record}
                          now={now}
                          setOptimisticRecords={setOptimisticRecords}
                          tags={tags}
                        />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      </div>
    </div>
  )
}

function RecordDetails({ record, now, setOptimisticRecords, tags }) {
  return (
    <>
      <Drawer shouldScaleBackground={false}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="w-full h-full rounded-none px-2">
            <div className="flex flex-col gap-1 w-full">
              <div className="w-full flex justify-between items-end">
                <div>
                  <Time date={record.begin} /> -{" "}
                  {record.end && <Time date={record.end} />}
                </div>
                <Duration records={[record]} now={now} />
              </div>
              <div className="flex gap-1 items-start w-full overflow-auto">
                <RecordTags record={record} />
              </div>
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[90vh] mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>
              On{" "}
              {differenceInCalendarDays(new Date(), new Date(record.begin)) > 1
                ? capitalize(
                    formatInTimeZone(
                      new Date(record.begin),
                      "America/Sao_Paulo",
                      "eeee, MMM dd",
                      { locale },
                    ),
                  )
                : `${capitalize(
                    formatRelative(new Date(record.begin), new Date(), {
                      locale,
                    }).split(" ")[0],
                  )}, ${formatInTimeZone(
                    new Date(record.begin),
                    "America/Sao_Paulo",
                    "MMM dd",
                    { locale },
                  )}`}
            </DrawerTitle>
            <DrawerDescription>Record details</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 px-4 pb-4">
            <div className="flex items-center justify-center space-x-2">
              <Time date={record.begin} />
              <span>-</span>
              {record.end && <Time date={record.end} />}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap gap-1">
                <RecordTags
                  record={record}
                  deletable
                  setOptimisticRecords={setOptimisticRecords}
                />
              </div>
              <AddTag
                tags={tags}
                record={record}
                setOptimisticRecords={setOptimisticRecords}
              />
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <form
                action={async () => {
                  setOptimisticRecords({
                    action: "delete",
                    newRecord: record,
                  })
                  await deleteRecord(record.id)
                }}
              >
                <Button variant="destructive" type="submit" className="w-full">
                  Delete
                </Button>
              </form>
            </DrawerClose>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function RecordTags({
  record,
  deletable = false,
  setOptimisticRecords = ({}) => {},
}) {
  if (record.tags.length === 0) {
    return (
      <Badge variant="outline" className="border-transparent text-transparent">
        No tags
      </Badge>
    )
  }
  return (
    <>
      {record.tags.map((tag: { id: string; value: string }) => (
        <Badge
          key={tag.id}
          className={cn(
            "gap-1",
            deletable && "pr-1",
            record.isSaving && "animate-pulse",
          )}
        >
          {tag.value}
          {deletable && (
            <form
              action={async () => {
                setOptimisticRecords({
                  action: "remove_tag",
                  newRecord: record,
                  tag,
                })
                await removeTagFromRecord(tag.id, record.id)
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </form>
          )}
        </Badge>
      ))}
    </>
  )
}

function Time({ date }) {
  return (
    <span>
      <span>
        {formatInTimeZone(new Date(date), "America/Sao_Paulo", "HH:mm")}
      </span>
      <span className="text-[0.8em] text-gray-500">
        {formatInTimeZone(new Date(date), "America/Sao_Paulo", ":ss")}
      </span>
    </span>
  )
}

function AddTag({
  tags,
  record,
  setOptimisticRecords,
}: {
  tags: Tag[]
  record: Record
  setOptimisticRecords: ({}) => void
}) {
  const form = useForm()
  const submitForm = form.handleSubmit(async ({ tagId, tagValue }) => {
    let tag = tags.find((t) => t.id === tagId)
    if (!tag) {
      tag = {
        id: "new-tag",
        value: tagValue,
      }
    }
    if (!tag.value) {
      throw new Error("Tag has to have a value. wat")
    }
    setOptimisticRecords({
      action: "add_tag",
      newRecord: record,
      tag,
    })
    await addTagToRecord(tag, record.id)
  })
  const CreateNewTag = () => {
    const newTag = useCommandState((state) => state.search)
    if (!newTag) return null
    return (
      <CommandItem
        value="new-tag"
        onSelect={() => {
          form.setValue("tagId", null)
          form.setValue("tagValue", newTag)
          submitForm()
        }}
      >
        Create tag: {newTag}
      </CommandItem>
    )
  }

  return (
    <Form {...form}>
      <form>
        <Popover>
          <div className="w-full text-center">
            <PopoverTrigger
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              + Add Tag
            </PopoverTrigger>
          </div>
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
                    (t) =>
                      t.value.toLowerCase() === search.toLowerCase().trim(),
                  )
                ) {
                  return 1
                }
                return 0
              }}
            >
              <CommandInput />
              <CommandList className="max-h-[160px]">
                {tags
                  .sort((a, b) => {
                    const aValue = a.value.toLowerCase()
                    const bValue = b.value.toLowerCase()
                    if (aValue > bValue) return 1
                    if (bValue > aValue) return -1
                    return 0
                  })
                  .filter(
                    (tag) =>
                      record.tags.findIndex((t) => t.id === tag.id) === -1,
                  )
                  .map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.id}
                      onSelect={(tagId) => {
                        form.setValue("tagId", tagId)
                        submitForm()
                      }}
                    >
                      {tag.value}
                    </CommandItem>
                  ))}
                <CreateNewTag />
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </form>
    </Form>
  )
}

function groupRecords(records: Record[]): { [key: string]: Record[] } {
  return records.reduce((acc, record) => {
    const day = formatInTimeZone(
      new Date(record.begin),
      "America/Sao_Paulo",
      "yyyy-MM-dd",
    )
    acc[day] = acc[day] ?? []
    acc[day].push(record)
    return acc
  }, {})
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
