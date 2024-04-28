"use client"

import { usePathname } from "next/navigation"

export function CurrentPage() {
  const pathname = usePathname()
  return (
    <span className="text-xl font-bold capitalize">{pathname?.slice(1)}</span>
  )
}
