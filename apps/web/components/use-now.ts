"use client"

import { useEffect, useState } from "react"

// The current time, refreshed every second while `ticking`, so durations that run up to now keep counting.
function useNow(ticking: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!ticking) return
    const tick = () => setNow(Date.now())
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [ticking])
  return now
}

export { useNow }
