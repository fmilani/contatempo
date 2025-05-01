import { type ClassValue, clsx } from "clsx"
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  sub,
} from "date-fns"
import { getTimezoneOffset } from "date-fns-tz"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildRangeQueryParams({ from, to }) {
  return new URLSearchParams({
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  })
}

export function getRanges() {
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

  return {
    today: { from: startOfDay(todayOffseted), to: endOfDay(todayOffseted) },
    thisWeek: {
      from: startOfWeek(todayOffseted),
      to: endOfWeek(todayOffseted),
    },
    thisMonth: {
      from: startOfMonth(todayOffseted),
      to: endOfMonth(todayOffseted),
    },
    lastMonth: {
      from: startOfMonth(sub(todayOffseted, { months: 1 })),
      to: endOfMonth(sub(todayOffseted, { months: 1 })),
    },
  }
}
