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
    <div className="flex flex-col gap-8 h-full w-full max-w-4xl mx-auto px-4">
      <header className="mt-4 rounded-xl drop-shadow-sm bg-white flex">
        <div className="p-4 flex-1">
          <Link href="/dashboard">
            <span className="text-2xl">
              conta<span className="font-bold">tempo</span>
            </span>
          </Link>
        </div>
        <UserMenu user={user} />
      </header>
      <main className="flex-1">{children}</main>
      <footer className="p-4 text-center border-t border-t-gray-200">
        <a
          href="https://www.github.com/fmilani"
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Feito com ❤️ por fmilani
        </a>
      </footer>
    </div>
  );
}
