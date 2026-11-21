import type { Metadata } from "next"
import { Suspense } from "react"
import { HistoryRoute } from "@/components/history-route"

export const metadata: Metadata = { title: "History" }

// The filters come from the URL, which isn't known when the page is prerendered.
export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <p role="status" className="text-(--ui-muted-foreground)">
          Loading entries…
        </p>
      }
    >
      <HistoryRoute />
    </Suspense>
  )
}
