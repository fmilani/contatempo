import { getRecords } from "@/lib/api";
import { zonedTimeToUtc } from "date-fns-tz";
import RecordsList from "@/components/RecordsList"

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: { from: string; to: string };
}) {
  const fromParam = searchParams?.from ?? "2020-01-01";
  const toParam = searchParams?.to ?? "2025-12-31";
  const records = await getRecords({
    from: zonedTimeToUtc(`${fromParam} 00:00:00`, "America/Sao_Paulo"),
    to: zonedTimeToUtc(`${toParam} 23:59:59`, "America/Sao_Paulo"),
  });
  return (
    <RecordsList records={records} />
  );
}
