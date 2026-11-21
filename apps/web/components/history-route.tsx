"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { parseHistoryQuery, serializeHistoryQuery, type HistoryQuery } from "@/lib/history-query"
import { useApi } from "./api-context"
import { HistoryView } from "./tracker"

// The filters live in the URL. They're kept in state too, so a change shows at once rather than
// when the URL catches up, and the state follows the URL when it changes from outside, like Back.
function HistoryRoute() {
  const api = useApi()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const urlKey = searchParams.toString()
  const [seen, setSeen] = useState(urlKey)
  const [query, setQuery] = useState(() => parseHistoryQuery(searchParams))

  if (urlKey !== seen) {
    setSeen(urlKey)
    const fromUrl = parseHistoryQuery(searchParams)
    if (serializeHistoryQuery(fromUrl) !== serializeHistoryQuery(query)) setQuery(fromUrl)
  }

  function change(next: HistoryQuery) {
    const key = serializeHistoryQuery(next)
    setQuery(next)
    setSeen(key)
    // Replace rather than push, so Back leaves the page instead of undoing each filter.
    window.history.replaceState(null, "", key ? `${pathname}?${key}` : pathname)
  }

  return <HistoryView api={api} query={query} onQueryChange={change} />
}

export { HistoryRoute }
