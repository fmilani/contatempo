import { redirect } from "next/navigation";
import LogoutButton from "../../components/LogoutButton";
import { getCurrentUser } from "../../lib/session";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();
  if (!user) {
    return redirect("/");
  }
  return (
    <div>
      <header>
        {`Olá ${user ? user.name : "desconhecido"}`}
        <LogoutButton />
      </header>
      <main>{children}</main>
    </div>
  );
}
