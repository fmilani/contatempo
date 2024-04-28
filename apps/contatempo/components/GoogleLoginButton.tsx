"use client"

import React from "react"
import { signIn } from "next-auth/react"

export default function LoginButton() {
  return (
    <button
      onClick={() =>
        signIn("google", { callbackUrl: `${window.location.origin}/dashboard` })
      }
    >
      Login com Google
    </button>
  )
}
