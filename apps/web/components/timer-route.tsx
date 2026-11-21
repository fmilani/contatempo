"use client"

import { useApi } from "./api-context"
import { TimerView } from "./tracker"

function TimerRoute() {
  return <TimerView api={useApi()} />
}

export { TimerRoute }
