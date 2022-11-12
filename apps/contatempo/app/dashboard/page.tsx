import { getRecords } from "../../lib/api";

export default async function DashboardPage() {
  const records = await getRecords({
    from: new Date(2020, 1, 1),
    to: new Date(2023, 2, 1),
  });
  return (
    <div>
      <p>DashboardPage</p>
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
