import { Suspense } from "react"
import { TimerRoute } from "@/components/timer-route"

// The date picker isn't on this page any more, but the timer reads the clock as it renders.
export default function TimerPage() {
  return (
    <Suspense>
      <TimerRoute />
    </Suspense>
  )
}
