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
import { useState } from "react"
import type { Label } from "@/lib/api"
import { rangePresets, type DayRange } from "@/lib/time"
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
        <DatePicker
          mode="range"
          value={range}
          onValueChange={(value) => onRangeChange(value as DayRange | null)}
          onOpenChange={(open) => open && setPresets(rangePresets(new Date()))}
        >
          <div role="group" aria-labelledby="filter-dates" className="flex items-center gap-1">
            <DatePickerInput aria-label="From date" placeholder="From" />
            <span aria-hidden="true">–</span>
            <DatePickerInput end aria-label="To date" placeholder="To" />
            <DatePickerClear aria-label="Clear dates" />
            <DatePickerTrigger />
          </div>
          <DatePickerContent>
            <CalendarPrevious />
            <CalendarHeading />
            <CalendarNext />
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
