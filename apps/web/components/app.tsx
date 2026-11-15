"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createApi } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import { Tracker } from "./tracker"

function App() {
  const router = useRouter()
  const [{ api, supabase }] = useState(() => {
    const supabase = createClient()
    return { supabase, api: createApi(supabase) }
  })

  return (
    <Tracker
      api={api}
      onSignOut={async () => {
        await supabase.auth.signOut()
        router.push("/login")
      }}
    />
  )
}

export { App }
