import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-full flex items-center justify-center">
      <div className="mb-48 flex flex-col items-center justify-center bg-background font-sans dark:bg-black">
        <p className="text-4xl font-bold ">contatempo</p>
        <span className="font-light">A simple time tracker.</span>
        <Button asChild variant="ghost" size="icon-lg">
          <Link href="/now">
            <Play />
          </Link>
        </Button>
      </div>
    </div>
  );
}
