import "./globals.css"

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html>
      <head />
      <body className="antialiased bg-background">
        <div vaul-drawer-wrapper="">
          <div className="bg-background">{children}</div>
        </div>
      </body>
    </html>
  )
}
