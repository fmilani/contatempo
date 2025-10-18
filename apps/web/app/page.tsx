import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-background font-sans dark:bg-black">
      <p className="text-4xl font-bold ">Contatempo</p>
      <span className="font-light">A simple time tracker.</span>
      <Button variant="ghost" size="icon-lg">
        <Play />
      </Button>
    </div>
  );
}
