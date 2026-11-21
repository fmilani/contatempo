import { createLocalStorage, createPreference } from "@ui-sdk/core"

// Two choices only: follow the system, or show the opposite of it.
export const theme = createPreference({
  values: ["system", "inverted"],
  defaultValue: "system",
  attribute: "data-theme",
  global: true,
  storage: createLocalStorage("contatempo-theme"),
})
