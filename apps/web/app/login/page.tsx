import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = { title: "Sign in" }

async function Login({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const { error } = await searchParams
  return <LoginForm linkFailed={error === "link"} />
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense>
      <Login searchParams={searchParams} />
    </Suspense>
  )
}
