import { formatInTimeZone } from "date-fns-tz"
import locale from "date-fns/locale/en-US"
import Duration from "@/components/Duration"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { deleteRecord, removeTagFromRecord } from "../actions"
import differenceInCalendarDays from "date-fns/differenceInCalendarDays"
import formatRelative from "date-fns/formatRelative"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function RecordDetails({ record, now, setOptimisticRecords }) {
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
                <RecordTags record={record} />
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
            <div className="flex flex-col gap-4 p-4">
              <div className="flex items-center justify-center space-x-2">
                <Time date={record.begin} />
                <span>-</span>
                {record.end && <Time date={record.end} />}
              </div>
              <div className="flex flex-wrap gap-1">
                <RecordTags
                  record={record}
                  deletable
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

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
