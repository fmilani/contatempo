import "./globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className="h-full bg-gray-100 text-gray-700/[.87]">
      <head />
      <body>{children}</body>
    </html>
  );
}
