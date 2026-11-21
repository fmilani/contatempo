"use client"

import { Button } from "@ui-sdk/react/button"
import { OverlayHost } from "@ui-sdk/react/overlays"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, type ReactNode } from "react"
import { createApi } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { ApiProvider } from "./api-context"
import { ThemeToggle } from "./theme-toggle"

const pages = [
  { href: "/", label: "Timer" },
  { href: "/history", label: "History" },
] as const

function Shell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [{ api, supabase }] = useState(() => {
    const supabase = createClient()
    return { supabase, api: createApi(supabase) }
  })

  return (
    <ApiProvider api={api}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-semibold tracking-tight">contatempo</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/login")
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
          <nav aria-label="Pages" className="page-tabs">
            {pages.map((page) => (
              <Button
                key={page.href}
                render={<Link href={page.href} />}
                aria-current={pathname === page.href ? "page" : undefined}
              >
                {page.label}
              </Button>
            ))}
          </nav>
        </header>
        {children}
      </div>
      <OverlayHost toast={{ "data-agent-hidden": "" } as object} />
    </ApiProvider>
  )
}

export { Shell }
