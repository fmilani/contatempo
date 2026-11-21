import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppPreferences } from "@/components/app-preferences";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "contatempo", template: "%s · contatempo" },
  description: "A simple time tracker.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script sets data-theme on <html> before React hydrates.
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AppPreferences>{children}</AppPreferences>
      </body>
    </html>
  );
}
