"use client"

import { Preferences } from "@ui-sdk/react/preferences"
import type { ReactNode } from "react"
import { theme } from "./theme"

function AppPreferences({ children }: { children: ReactNode }) {
  return <Preferences preferences={[theme]}>{children}</Preferences>
}

export { AppPreferences }
