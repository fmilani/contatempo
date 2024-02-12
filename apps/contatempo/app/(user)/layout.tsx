import { redirect } from "next/navigation";
import UserMenu from "@/components/UserMenu";
import { getCurrentUser } from "@/lib/session";
import Link from "next/link";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default async function UserLayout({ children }: UserLayoutProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <>
      <div className="h-full min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex max-w-2xl mx-auto">
        <div className="p-4 flex-1">
          <Link href="/dashboard">
            <span className="text-2xl">
              conta<span className="font-bold">tempo</span>
            </span>
          </Link>
        </div>
        <UserMenu user={user} />
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4">
        {children}
      </main>
      </div>
      <footer className="mt-4 p-4 text-center border-t border-border/40">
        <a
          href="https://www.github.com/fmilani"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Feito com ❤️ por fmilani
        </a>
      </footer>
    </>
  );
}
