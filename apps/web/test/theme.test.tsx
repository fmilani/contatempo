import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, expect, test, vi } from "vitest"
import { AppPreferences } from "@/components/app-preferences"
import { theme } from "@/components/theme"
import { ThemeToggle } from "@/components/theme-toggle"

let systemDark = false
const listeners = new Set<() => void>()

beforeEach(() => {
  systemDark = false
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        get matches() {
          return query.includes("dark") && systemDark
        },
        media: query,
        addEventListener: (_: string, listener: () => void) => listeners.add(listener),
        removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
      }) as unknown as MediaQueryList
  )
})

afterEach(() => {
  theme.set("system")
  localStorage.clear()
  listeners.clear()
  vi.restoreAllMocks()
})

const renderToggle = () =>
  render(
    <AppPreferences>
      <ThemeToggle />
    </AppPreferences>
  )

test("the toggle switches between the system theme and the opposite one, and saves the choice", async () => {
  const user = userEvent.setup()
  renderToggle()

  const toggle = screen.getByRole("button", { name: "Dark theme" })
  expect(toggle.getAttribute("aria-pressed")).toBe("false")
  expect(document.documentElement.dataset.theme).toBe("system")

  await user.click(toggle)
  expect(toggle.getAttribute("aria-pressed")).toBe("true")
  expect(document.documentElement.dataset.theme).toBe("inverted")
  expect(localStorage.getItem("contatempo-theme")).toContain("inverted")

  await user.click(toggle)
  expect(toggle.getAttribute("aria-pressed")).toBe("false")
  expect(document.documentElement.dataset.theme).toBe("system")
})

test("the name follows the system: it offers the theme the system isn't using", async () => {
  systemDark = true
  renderToggle()
  expect(await screen.findByRole("button", { name: "Light theme" })).toBeTruthy()

  systemDark = false
  act(() => listeners.forEach((listener) => listener()))
  expect(screen.getByRole("button", { name: "Dark theme" })).toBeTruthy()
})

test("Space toggles it from the keyboard", async () => {
  const user = userEvent.setup()
  renderToggle()

  await user.tab()
  await user.keyboard(" ")
  expect(document.documentElement.dataset.theme).toBe("inverted")
})
