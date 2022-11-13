import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/session";

interface UserLayoutProps {
  children: React.ReactNode;
}

export default async function UserLayout({ children }: UserLayoutProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  return (
    <>
      <header>
        Contatempo - {user ? user.name : "Anônimo"}
        <LogoutButton />
      </header>
      <main>{children}</main>
      <footer>footer</footer>
    </>
  );
}
