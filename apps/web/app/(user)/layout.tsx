import { ReactNode } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { UserMenu } from "./user-menu";
import { RecentRecordsProvider } from "./recent-records-provider";
import { RecordingContainer } from "@/app/(user)/now/records";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen overflow-hidden">
      <header className="px-4 sm:px-6 lg:px-8 min-h-[64px] flex justify-between items-center border-b border-gray-200">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-3xl">⏱️</span>
          <span className="text-xl font-bold">contatempo</span>
        </Link>
        <RecordingContainer />
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <div className="absolute top-[64px] flex h-[calc(100dvh-64px)] w-full flex-col items-center justify-between overflow-y-auto">
        <main className="w-full min-h-full shrink-0 p-4">{children}</main>
        <footer className="w-full min-h-[64px] flex justify-center items-center border-t border-gray-200">
          Made with ❤️ by&nbsp;
          <a
            href="https://www.fmilani.dev"
            target="_blank"
            className="underline"
          >
            fmilani
          </a>
        </footer>
      </div>
    </section>
  );
}
