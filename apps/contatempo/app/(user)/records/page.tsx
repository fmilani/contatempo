import CurrentRecord from "@/components/CurrentRecord";
import { getRecords, Record } from "@/lib/api";
import format from "date-fns/format";
import ptbr from "date-fns/locale/pt-BR";
import parse from "date-fns/parse";

function groupRecords(records: Record[]): { [key: string]: Record[] } {
  return records.reduce((acc, record) => {
    const day = format(new Date(record.begin), "yyyy-MM-dd");
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
              {format(parse(day, "yyyy-MM-dd", new Date()), "dd 'de' MMMM", {
                locale: ptbr,
              })}
            </div>
            <ul className="rounded-lg drop-shadow-sm bg-white divide divide-y">
              {recordsOfDay.reverse().map((record) => (
                <li className="p-4" key={record.id}>
                  {format(new Date(record.begin), "HH:mm:ss O")} -{" "}
                  {format(new Date(record.end), "HH:mm:ss")}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
