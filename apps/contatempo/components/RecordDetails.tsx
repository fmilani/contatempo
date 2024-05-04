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
import { deleteRecord } from "../actions"
import differenceInCalendarDays from "date-fns/differenceInCalendarDays"
import formatRelative from "date-fns/formatRelative"

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
                <RecordTags tags={record.tags} />
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
                <RecordTags tags={record.tags} />
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

function RecordTags({ tags }) {
  return (
    <>
      {tags.map((tag: { id: string; value: string }) => (
        <Badge key={tag.id} className="snap-start">
          {tag.value}
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
