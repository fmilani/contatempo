"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface DateRangePickerProps {
  initialRange: DateRange
  onSelect: any
}

export function DateRangePicker({
  initialRange,
  onSelect,
}: DateRangePickerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [date, setDate] = React.useState<DateRange | undefined>(initialRange)
  const [open, setOpen] = React.useState(false)

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        if (!open) setDate(initialRange)
        setOpen(open)
      }}
    >
      <PopoverTrigger>
        <Badge
          id="date"
          variant="secondary"
          className={cn("font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={isDesktop ? 2 : 1}
        />
        <div className="flex justify-center pb-3 gap-4">
          <Button
            onClick={() => {
              setDate(initialRange)
              setOpen(false)
            }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpen(false)
              onSelect(date)
            }}
            disabled={!date || !date.from || !date.to}
          >
            Select
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
