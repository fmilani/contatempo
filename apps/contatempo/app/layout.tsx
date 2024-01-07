import "./globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className="antialiased bg-gray-100 text-gray-700/[.87]">
      <head />
      <body><div vaul-drawer-wrapper="" className="bg-gray-100 min-h-[100svh]">{children}</div></body>
    </html>
  );
}
