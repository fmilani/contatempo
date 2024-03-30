import { getRecords } from "@/lib/api";
import { zonedTimeToUtc } from "date-fns-tz";
import { Suspense } from "react";
import RecordsList from "@/components/RecordsList"
import { RecordsRange } from "@/components/RecordsRange"
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Records | Contatempo',
  description: 'Track your time',
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: { from: string; to: string };
}) {
  const fromParam = searchParams?.from ?? "2020-01-01";
  const toParam = searchParams?.to ?? "2025-12-31";
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <RecordsRange />
      </div>
      <Suspense key={`${fromParam}-${toParam}`} fallback="carregando">
        <Records from={fromParam} to={toParam} />
      </Suspense>
    </div>
  );
}

async function Records({ from, to }) {
  const records = await getRecords({
    from: zonedTimeToUtc(`${from} 00:00:00`, "America/Sao_Paulo"),
    to: zonedTimeToUtc(`${to} 23:59:59`, "America/Sao_Paulo"),
  });
  return <RecordsList records={records} />
}
