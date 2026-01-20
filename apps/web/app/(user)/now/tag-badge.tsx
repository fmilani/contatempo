import { MouseEventHandler, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "@/lib/db/schema";
export function TagBadge({
  tag,
  children,
  onClick,
}: {
  tag?: Tag;
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLSpanElement>;
}) {
  return (
    <Badge
      variant="outline"
      className={`text-xs border ${getTagColor(tag)}`}
      onClick={onClick}
    >
      {children}
    </Badge>
  );
}

function getTagColor(tag?: Tag): string {
  const tagColors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200",
    indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
    cyan: "bg-cyan-100 text-cyan-800 border-cyan-200",
    slate: "bg-slate-100 text-slate-800 border-slate-200",
    emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
    violet: "bg-violet-100 text-violet-800 border-violet-200",
    rose: "bg-rose-100 text-rose-800 border-rose-200",
    teal: "bg-teal-100 text-teal-800 border-teal-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    lime: "bg-lime-100 text-lime-800 border-lime-200",
    sky: "bg-sky-100 text-sky-800 border-sky-200",
  };

  return (
    (tag && tagColors[tag.color]) || "bg-gray-100 text-gray-800 border-gray-200"
  );
}
