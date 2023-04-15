import { zeroPad } from "@/lib/helpers";

export default function Card({ title, time }) {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = (time % 3600) % 60;
  return (
    <div className="rounded-lg drop-shadow-sm bg-white p-4 hover:bg-slate-200 flex flex-col gap-1">
      <div className="font-bold text-lg">{title}</div>
      <div className="">{`${zeroPad(h)}h ${zeroPad(m)}m ${zeroPad(s)}s`}</div>
    </div>
  );
}

Card.Skeleton = function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`rounded-lg drop-shadow-sm bg-white p-4 flex flex-col gap-1 ${className}`}
    >
      <div className="h-7 w-24 animate-pulse rounded-lg bg-slate-200"></div>
      <div className="h-6 w-32 animate-pulse rounded-lg bg-slate-200"></div>
    </div>
  );
};
