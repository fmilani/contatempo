"use client"

import { createContext, use, type ReactNode } from "react"
import type { Api } from "@/lib/api"

const ApiContext = createContext<Api | null>(null)

function ApiProvider({ api, children }: { api: Api; children: ReactNode }) {
  return <ApiContext value={api}>{children}</ApiContext>
}

function useApi() {
  const api = use(ApiContext)
  if (!api) throw new Error("useApi must be used inside an ApiProvider")
  return api
}

export { ApiProvider, useApi }
