import { getRecords } from "@/lib/api";

export default async function RecordsPage() {
  const records = await getRecords({
    from: new Date(2020, 1, 1),
    to: new Date(2023, 2, 1),
  });
  return (
    <div>
      <h1 className="text-3xl font-bold">Records</h1>
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
