"use client"

import { usePreference } from "@ui-sdk/react/preferences"
import { Toggle } from "@ui-sdk/react/toggle"
import { useSyncExternalStore } from "react"
import { MoonIcon, SunIcon } from "./icons"
import { theme } from "./theme"

const darkQuery = "(prefers-color-scheme: dark)"

function subscribe(onChange: () => void) {
  const query = window.matchMedia(darkQuery)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

// Pressed shows the opposite of the system's theme. The name says which theme that is.
// CSS picks the icon, so it's right before hydration too.
function ThemeToggle() {
  const { value } = usePreference(theme)
  const systemDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(darkQuery).matches,
    () => false
  )

  return (
    <Toggle
      className="theme-toggle"
      aria-label={systemDark ? "Light theme" : "Dark theme"}
      pressed={value === "inverted"}
      onPressedChange={(pressed, details) =>
        theme.set(pressed ? "inverted" : "system", { event: details.event })
      }
    >
      <span className="theme-icon theme-icon-moon">
        <MoonIcon />
      </span>
      <span className="theme-icon theme-icon-sun">
        <SunIcon />
      </span>
    </Toggle>
  )
}

export { ThemeToggle }
