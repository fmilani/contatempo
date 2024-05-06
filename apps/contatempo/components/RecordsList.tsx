"use client"

import React, { useOptimistic, useState, useTransition } from "react"
import { formatInTimeZone } from "date-fns-tz"
import { X, Plus } from "lucide-react"
import { Record, Tag } from "@/lib/api"
import locale from "date-fns/locale/en-US"
import Duration from "@/components/Duration"
import { differenceInCalendarDays, formatRelative } from "date-fns"
import CurrentRecord from "@/components/CurrentRecord"
import useInterval from "@/lib/hooks/useInterval"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
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
  return (
    <div className="space-y-2">
      <CurrentRecord
        record={optmisticRecords.find((record: Record) => !record.end)}
        now={now}
        setOptimisticRecords={setOptimisticRecords}
      />
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            Total
            <Duration records={optmisticRecords} now={now} />
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="space-y-2">
        {Object.entries(groupRecords(optmisticRecords)).map(
          ([day, recordsOfDay]) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-base flex justify-between">
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
                <ul className="space-y-2">
                  {recordsOfDay.reverse().map((record) => (
                    <li
                      key={record.id}
                      className={cn(
                        (record as any).isSaving && "animate-pulse",
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
  )
}

function RecordDetails({ record, now, setOptimisticRecords, tags }) {
  return (
    <>
      <Drawer shouldScaleBackground={false}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="w-full px-6 rounded-none">
            <div className="flex flex-col gap-1 w-full">
              <div className="w-full flex justify-between">
                <div>
                  <Time date={record.begin} /> -{" "}
                  {record.end && <Time date={record.end} />}
                </div>
                <Duration records={[record]} now={now} />
              </div>
              <div className="flex gap-1 items-start w-full overflow-auto snap-x">
                <RecordTags record={record} tags={tags} />
              </div>
            </div>
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>
                On{" "}
                {differenceInCalendarDays(new Date(), new Date(record.begin)) >
                1
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
            <div className="flex flex-col gap-4 px-4 pb-4">
              <div className="flex flex-wrap gap-1">
                <RecordTags
                  record={record}
                  deletable
                  setOptimisticRecords={setOptimisticRecords}
                  tags={tags}
                />
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Time date={record.begin} />
                <span>-</span>
                {record.end && <Time date={record.end} />}
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
                  <Button
                    variant="destructive"
                    type="submit"
                    className="w-full"
                  >
                    Delete
                  </Button>
                </form>
              </DrawerClose>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}

function RecordTags({
  record,
  deletable = false,
  setOptimisticRecords = ({}) => {},
  tags,
}) {
  return (
    <>
      {record.tags.map((tag: { id: string; value: string }) => (
        <Badge
          key={tag.id}
          className={cn(
            "gap-1 snap-start pr-1",
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
      {deletable && (
        <AddTag
          tags={tags}
          record={record}
          setOptimisticRecords={setOptimisticRecords}
        />
      )}
    </>
  )
}

function Time({ date }) {
  return (
    <span>
      <span>
        {formatInTimeZone(new Date(date), "America/Sao_Paulo", "HH:mm")}
      </span>
      <span className="text-gray-400">
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

  return (
    <Form {...form}>
      <form>
        <Popover>
          <PopoverTrigger className="inline-flex">
            <Badge className="gap-1 pl-1" variant="outline">
              <Plus className="h-4 w-4" />
              Tag
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="p-0">
            <Command
              label="Command Menu"
              filter={(value, search) => {
                const tag = tags.find((t) => t.id === value)
                if (tag?.value.toLowerCase().includes(search.toLowerCase())) {
                  return 1
                }
                return 0
              }}
            >
              <CommandInput />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {tags
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
                        form.handleSubmit(async ({ tagId }) => {
                          const tag = tags.find((t) => t.id === tagId)
                          if (!tag) {
                            throw new Error("Tag not found. wat")
                          }
                          setOptimisticRecords({
                            action: "add_tag",
                            newRecord: record,
                            tag,
                          })
                          await addTagToRecord(tagId, record.id)
                        })()
                      }}
                    >
                      {tag.value}
                    </CommandItem>
                  ))}
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
