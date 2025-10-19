import { ReactNode } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "./user-menu";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <section>
      <header className="px-4 sm:px-6 lg:px-8 min-h-[64px] flex justify-between items-center border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">⏱️</span>
          <span className="text-xl font-bold">contatempo</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      {children}
    </section>
  );
}
