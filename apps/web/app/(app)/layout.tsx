import { Shell } from "@/components/shell"

export default function AppLayout({ children }: LayoutProps<"/">) {
  return <Shell>{children}</Shell>
}
