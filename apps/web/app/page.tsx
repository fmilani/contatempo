import { Suspense } from "react"
import { App } from "@/components/app"

// The date picker reads today's date as it renders, so the tracker can't be part of the static shell.
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl px-4 py-6">
          <h1 className="text-xl font-semibold tracking-tight">contatempo</h1>
        </div>
      }
    >
      <App />
    </Suspense>
  )
}
