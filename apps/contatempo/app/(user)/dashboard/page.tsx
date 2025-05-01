import { getSummary } from "@/lib/api"
import getTimezoneOffset from "date-fns-tz/getTimezoneOffset"
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc"
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns"
import sub from "date-fns/sub"
import Link from "next/link"
import { buildRangeQueryParams } from "@/components/lib/utils"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import TimeFormat from "@/components/TimeFormat"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard | Contatempo",
  description: "Check your time tracking",
}

export default async function DashboardPage() {
  const todayOffseted = sub(new Date(), {
    seconds:
      (getTimezoneOffset(
        process.env.TZ === ":UTC"
          ? "Europe/London"
          : process.env.TZ || "America/Sao_Paulo",
      ) -
        getTimezoneOffset("America/Sao_Paulo")) /
      1000,
  })
  const sot = startOfDay(todayOffseted)
  const eot = endOfDay(todayOffseted)
  const sow = startOfWeek(todayOffseted)
  const eow = endOfWeek(todayOffseted)
  const som = startOfMonth(todayOffseted)
  const eom = endOfMonth(todayOffseted)
  const solm = startOfMonth(sub(todayOffseted, { months: 1 }))
  const eolm = endOfMonth(sub(todayOffseted, { months: 1 }))
  return (
    <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
      <DashboardCard from={sot} to={eot} title="Today" />
      <DashboardCard from={sow} to={eow} title="This week" />
      <DashboardCard from={som} to={eom} title="This month" />
      <DashboardCard from={solm} to={eolm} title="Last month" />
    </div>
  )
}

function DashboardCard({ from, to, title }) {
  return (
    <Link href={`/records?${buildRangeQueryParams({ from, to })}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            {title}
            <Suspense fallback={<Time.Skeleton />}>
              <Time from={from} to={to} />
            </Suspense>
          </CardTitle>
        </CardHeader>
      </Card>
    </Link>
  )
}

async function Time({ from, to }) {
  const time = await getSummary(getSummaryInterval(from, to))
  return <TimeFormat time={time} />
}
Time.Skeleton = function TimeSkeleton() {
  return <Skeleton className="w-[82px] h-[26px]" />
}

function getSummaryInterval(from: Date, to: Date) {
  return {
    from: zonedTimeToUtc(from, "America/Sao_Paulo"),
    to: zonedTimeToUtc(to, "America/Sao_Paulo"),
  }
}
