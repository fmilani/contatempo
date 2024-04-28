import Link from "next/link"

export function Logo() {
  return (
    <Link href="/dashboard">
      <span className="flex items-center justify-center text-2xl w-8 text-foreground bg-background">
        c<span className="font-bold">t</span>
      </span>
    </Link>
  )
}
