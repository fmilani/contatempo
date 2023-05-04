import CurrentRecord from "@/components/CurrentRecord";
import { getRecords, Record } from "@/lib/api";
import ptbr from "date-fns/locale/pt-BR";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import NewRecord from "@/components/NewRecord";
import Duration from "@/components/Duration";
import {
  differenceInCalendarDays,
  formatRelative,
  intervalToDuration,
} from "date-fns";
import { zeroPad } from "@/lib/helpers";

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

function Time({ date }) {
  return (
    <>
      <span>
        {formatInTimeZone(new Date(date), "America/Sao_Paulo", "HH:mm")}
      </span>
      <span className="text-sm text-gray-400">
        {formatInTimeZone(new Date(date), "America/Sao_Paulo", ":ss")}
      </span>
    </>
  );
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
      <div className="flex justify-between gap-4">
        <CurrentRecord
          record={records.find((r) => !r.end)}
          initialNow={new Date().toISOString()}
        />
        <NewRecord />
      </div>
      <h2 className="text-xl font-bold mt-8 mb-6">Registros</h2>
      <div className="space-y-8">
        {Object.entries(groupRecords(records)).map(([day, recordsOfDay]) => (
          <div
            key={day}
            className="rounded-lg drop-shadow-sm bg-white divide-y overflow-hidden"
          >
            <div className="flex justify-between text-lg font-bold p-4 bg-slate-200">
              <span>
                {differenceInCalendarDays(
                  new Date(),
                  new Date(recordsOfDay[0].begin)
                ) > 1
                  ? capitalize(
                      formatInTimeZone(
                        new Date(recordsOfDay[0].begin),
                        "America/Sao_Paulo",
                        "eeeeee, dd 'de' MMM",
                        { locale: ptbr }
                      )
                    )
                  : `${capitalize(
                      formatRelative(
                        new Date(recordsOfDay[0].begin),
                        new Date(),
                        {
                          locale: ptbr,
                        }
                      ).split(" ")[0]
                    )}, ${formatInTimeZone(
                      new Date(recordsOfDay[0].begin),
                      "America/Sao_Paulo",
                      "dd 'de' MMM",
                      { locale: ptbr }
                    )}`}
              </span>
              <span>
                <Duration records={recordsOfDay} />
              </span>
            </div>
            <ul className="divide-y">
              {recordsOfDay.reverse().map((record) => (
                <li className="p-4 flex justify-between" key={record.id}>
                  <div>
                    <Time date={record.begin} /> -{" "}
                    {record.end && <Time date={record.end} />}
                  </div>
                  <Duration records={[record]} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
