import CurrentRecord from "@/components/CurrentRecord";
import { getRecords } from "@/lib/api";

export default async function RecordsPage() {
  const records = await getRecords({
    from: new Date(2020, 1, 1),
    to: new Date(2023, 2, 1),
  });
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold">Records</span>
        <CurrentRecord record={records.find((r) => !r.end)} />
      </div>
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            {record.begin} - {record.end}
          </li>
        ))}
      </ul>
    </div>
  );
}
