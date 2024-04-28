"use client"

import React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DateRangePicker } from "@/components/DateRangePicker"
import { format, parse } from "date-fns"
import type { DateRange } from "react-day-picker"

export function RecordsRange() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams?.get("from")
  const to = searchParams?.get("to")
  return (
    <DateRangePicker
      initialRange={{
        from: from ? parse(from, "yyyy-MM-dd", new Date()) : undefined,
        to: to ? parse(to, "yyyy-MM-dd", new Date()) : undefined,
      }}
      onSelect={(range: DateRange) => {
        if (range?.from && range?.to) {
          router.push(
            `/records?from=${format(range.from, "yyyy-MM-dd")}&to=${format(range.to, "yyyy-MM-dd")}`,
          )
        }
      }}
    />
  )
}
