import CurrentRecord from "@/components/CurrentRecord";
import { getRecords, Record } from "@/lib/api";
import ptbr from "date-fns/locale/pt-BR";
import { formatInTimeZone } from "date-fns-tz";

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
export default async function RecordsPage() {
  const records = await getRecords({
    from: new Date(2020, 1, 1),
    to: new Date(2023, 2, 1),
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">Registros</span>
        <CurrentRecord record={records.find((r) => !r.end)} />
      </div>
      <div className="mt-8 space-y-4">
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
                    "HH:mm:ss O"
                  )}{" "}
                  -{" "}
                  {formatInTimeZone(
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
