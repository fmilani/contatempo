import { redirect } from "next/navigation"
import UserMenu from "@/components/UserMenu"
import { getCurrentUser } from "@/lib/session"
import { Logo } from "@/components/Logo"
import { CurrentPage } from "@/components/CurrentPage"

interface UserLayoutProps {
  children: React.ReactNode
}

export default async function UserLayout({ children }: UserLayoutProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/")
  }

  return (
    <>
      <div className="h-full min-h-[100svh] pb-2 space-y-2">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex max-w-2xl mx-auto">
            <div className="px-2 py-4 flex items-baseline flex-1 space-x-4">
              <Logo />
              <CurrentPage />
            </div>
            <UserMenu user={user} />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-2">{children}</main>
      </div>
      <footer className="p-4 text-center border-t border-border/40">
        <a
          href="https://www.github.com/fmilani"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Feito com ❤️ por fmilani
        </a>
      </footer>
    </>
  )
}
