"use client"

import { Button } from "@ui-sdk/react/button"
import { Field, FieldError, FieldLabel } from "@ui-sdk/react/field"
import { Input } from "@ui-sdk/react/input"
import { useState, type FormEvent } from "react"
import { createClient } from "@/lib/supabase/client"

function LoginForm({ linkFailed }: { linkFailed: boolean }) {
  const [supabase] = useState(createClient)
  const [email, setEmail] = useState("")
  const [sentTo, setSentTo] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(
    linkFailed ? "That sign-in link is invalid or has expired. Request a new one." : ""
  )
  const redirectTo = () => `${window.location.origin}/auth/callback`

  async function sendLink(event: FormEvent) {
    event.preventDefault()
    setSending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo() },
    })
    setSending(false)
    setError(error?.message ?? "")
    setSentTo(error ? "" : email)
  }

  async function google() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    })
    if (error) setError(error.message)
  }

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">contatempo</h1>
        <p className="text-(--ui-muted-foreground)">Sign in to track your time.</p>
      </div>
      <form onSubmit={sendLink} className="flex flex-col gap-3">
        <Field name="email" invalid={error ? true : undefined}>
          <FieldLabel>Email</FieldLabel>
          <Input
            type="email"
            required
            autoComplete="email"
            value={email}
            onValueChange={(value) => {
              setEmail(value)
              setError("")
            }}
          />
          <FieldError match="valueMissing">Enter your email address.</FieldError>
          <FieldError match="typeMismatch">Enter an email address like you@example.com.</FieldError>
          {error ? <FieldError match>{error}</FieldError> : null}
        </Field>
        <Button type="submit" data-variant="solid" disabled={sending} focusableWhenDisabled>
          Email me a sign-in link
        </Button>
        <p role="status" className="text-sm">
          {sentTo ? `Check ${sentTo} for your sign-in link.` : ""}
        </p>
      </form>
      <div className="flex items-center gap-3 text-sm text-(--ui-muted-foreground)">
        <span className="h-px flex-1 bg-(--ui-border)" />
        or
        <span className="h-px flex-1 bg-(--ui-border)" />
      </div>
      <Button onClick={google}>Continue with Google</Button>
    </main>
  )
}

export { LoginForm }
