import { zeroPad } from "@/lib/helpers"
import intervalToDuration from "date-fns/intervalToDuration"

export function calculateDuration(records, now) {
  return records.reduce(
    (acc, record) => {
      const duration = intervalToDuration({
        start: new Date(record.begin),
        end: record.end ? new Date(record.end) : now,
      })
      const seconds = (acc.seconds + duration.seconds) % 60
      const minutes =
        (acc.minutes +
          duration.minutes +
          Math.floor((acc.seconds + duration.seconds) / 60)) %
        60
      const hours =
        acc.hours +
        duration.hours +
        Math.floor((acc.minutes + duration.minutes) / 60)
      return {
        hours,
        minutes,
        seconds,
      }
    },
    { hours: 0, minutes: 0, seconds: 0 },
  )
}
export default function Duration({ records, now }) {
  const duration = calculateDuration(records, now)
  return (
    <span>
      {zeroPad(duration.hours)}:{zeroPad(duration.minutes)}
      <span className="text-[0.8em] text-gray-500">
        :{zeroPad(duration.seconds)}
      </span>
    </span>
  )
}
