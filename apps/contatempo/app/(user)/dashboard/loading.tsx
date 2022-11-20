import { Card } from "./page";

export default function Loading() {
  return (
    <>
      <p className="text-xl font-bold mb-8">Dashboard</p>
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card.Skeleton className="sm:col-span-2" />
        <Card.Skeleton />
        <Card.Skeleton />
      </div>
    </>
  );
}
