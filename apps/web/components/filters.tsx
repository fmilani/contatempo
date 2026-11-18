"use client"

import {
  CalendarGrid,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  DatePicker,
  DatePickerClear,
  DatePickerContent,
  DatePickerInput,
  DatePickerPreset,
  DatePickerTrigger,
} from "@ui-sdk/react/date-picker"
import { Suspense, useState } from "react"
import type { Label } from "@/lib/api"
import { rangePresets, type DayRange } from "@/lib/time"
import { ChevronLeftIcon, ChevronRightIcon } from "./icons"
import { LabelPicker } from "./label-picker"

type FiltersProps = {
  labels: Label[]
  range: DayRange | null
  labelIds: string[]
  onRangeChange: (range: DayRange | null) => void
  onLabelIdsChange: (labelIds: string[]) => void
}

function Filters({ labels, range, labelIds, onRangeChange, onLabelIdsChange }: FiltersProps) {
  const [presets, setPresets] = useState<ReturnType<typeof rangePresets>>([])

  return (
    <section aria-label="Filters" className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-end">
      <div className="flex flex-col gap-1.5">
        <span id="filter-dates" className="text-[length:var(--ui-font-size)] font-medium">
          Dates
        </span>
        {/* The date picker reads today's date as it renders, which can't be prerendered. */}
        <Suspense fallback={<div className="h-8 w-full sm:w-80" />}>
          <DatePicker
            mode="range"
            presentation="auto"
            className="w-full sm:w-80"
            value={range}
            onValueChange={(value) => onRangeChange(value as DayRange | null)}
            onOpenChange={(open) => open && setPresets(rangePresets(new Date()))}
          >
            <div role="group" aria-labelledby="filter-dates" className="flex items-center gap-1 max-sm:gap-0.5">
              <DatePickerInput aria-label="From date" placeholder="From" className="min-w-0 flex-[1_1_0]" />
              <span aria-hidden="true">–</span>
              {/* web.css tucks Clear and the trigger into the input right before them, and pads
                  every input beside them to make room, so only the end input shares their wrapper. */}
              <div className="flex min-w-0 flex-[1_1_3.75rem] items-center">
                <DatePickerInput end aria-label="To date" placeholder="To" />
                <DatePickerClear aria-label="Clear dates" />
                <DatePickerTrigger />
              </div>
            </div>
            <DatePickerContent>
              <CalendarPrevious>
                <ChevronLeftIcon />
              </CalendarPrevious>
              <CalendarHeading />
              <CalendarNext>
                <ChevronRightIcon />
              </CalendarNext>
              <CalendarGrid />
              <div className="flex flex-wrap gap-1.5">
                {presets.map((preset) => (
                  <DatePickerPreset key={preset.label} value={preset.value}>
                    {preset.label}
                  </DatePickerPreset>
                ))}
              </div>
            </DatePickerContent>
          </DatePicker>
        </Suspense>
      </div>
      <LabelPicker
        name="Filter labels"
        placeholder="Any label"
        labels={labels}
        value={labelIds}
        onValueChange={onLabelIdsChange}
      />
    </section>
  )
}

export { Filters }
