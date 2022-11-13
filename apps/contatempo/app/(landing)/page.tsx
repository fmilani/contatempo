import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";
import { getCurrentUser } from "@/lib/session";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div>
      <h1>Contatempo</h1>
      <LoginButton />
    </div>
  );
}
