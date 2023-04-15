import CurrentRecord from "@/components/CurrentRecord";
import { getRecords, Record } from "@/lib/api";
import ptbr from "date-fns/locale/pt-BR";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import NewRecord from "@/components/NewRecord";

function groupRecords(records: Record[]): { [key: string]: Record[] } {
  return records.reduce((acc, record) => {
    const day = formatInTimeZone(
      new Date(record.begin),
      "America/Sao_Paulo",
      "yyyy-MM-dd"
    );
    acc[day] = acc[day] ?? [];
    acc[day].push(record);
    return acc;
  }, {});
}

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
    <div>
      <div className="flex justify-between">
        <CurrentRecord record={records.find((r) => !r.end)} />
        <NewRecord />
      </div>
      <p className="text-xl font-bold my-8">Registros</p>
      <div className="space-y-4">
        {Object.entries(groupRecords(records)).map(([day, recordsOfDay]) => (
          <div key={day}>
            <div className="mb-2">
              {formatInTimeZone(
                new Date(recordsOfDay[0].begin),
                "America/Sao_Paulo",
                "dd 'de' MMMM",
                {
                  locale: ptbr,
                }
              )}
            </div>
            <ul className="rounded-lg drop-shadow-sm bg-white divide divide-y">
              {recordsOfDay.reverse().map((record) => (
                <li className="p-4" key={record.id}>
                  {formatInTimeZone(
                    new Date(record.begin),
                    "America/Sao_Paulo",
                    "HH:mm:ss"
                  )}{" "}
                  -{" "}
                  {record.end &&
                    formatInTimeZone(
                      new Date(record.end),
                      "America/Sao_Paulo",
                      "HH:mm:ss"
                    )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
