"use client"

import Link from "next/link"
import React from "react"
import { useMediaQuery } from "@/hooks/useMediaQuery"

export function Logo() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  return (
    <Link href="/dashboard">
      <span className="text-2xl">
        {isDesktop ? 'conta' : 'c'}
        <span className="font-bold">{isDesktop ? 'tempo': 't'}</span>
      </span>
    </Link>
  )
}
