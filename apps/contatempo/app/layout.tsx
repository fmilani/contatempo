import "./globals.css";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <head />
      <body className="antialiased bg-background min-h-screen">
        <div vaul-drawer-wrapper="">
          <div className="bg-background min-h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
