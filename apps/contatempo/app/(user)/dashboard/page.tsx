import { getSummary } from "@/lib/api";
import getTimezoneOffset from "date-fns-tz/getTimezoneOffset";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import sub from "date-fns/sub";
import Link from "next/link";
import Card from "./Card";
import { buildRangeQueryParams } from "@/lib/utils";

export default async function DashboardPage() {
  const todayOffseted = sub(new Date(), {
    seconds:
      (getTimezoneOffset(
        process.env.TZ === ":UTC"
          ? "Europe/London"
          : process.env.TZ || "America/Sao_Paulo"
      ) -
        getTimezoneOffset("America/Sao_Paulo")) /
      1000,
  });
  const sot = startOfDay(todayOffseted);
  const eot = endOfDay(todayOffseted);
  const today = await getSummary(getSummaryInterval(sot, eot));
  const som = startOfMonth(todayOffseted);
  const eom = endOfMonth(todayOffseted);
  const thisMonth = await getSummary(getSummaryInterval(som, eom));
  const solm = startOfMonth(sub(todayOffseted, { months: 1 }));
  const eolm = endOfMonth(sub(todayOffseted, { months: 1 }));
  const lastMonth = await getSummary(getSummaryInterval(solm, eolm));
  return (
    <>
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Link
          href={`/records?${buildRangeQueryParams({ from: sot, to: eot })}`}
          className="sm:col-span-2"
        >
          <Card title="Hoje" time={today} />
        </Link>
        <Link href={`/records?${buildRangeQueryParams({ from: som, to: eom })}`}>
          <Card title="Esse mês" time={thisMonth} />
        </Link>
        <Link href={`/records?${buildRangeQueryParams({ from: solm, to: eolm })}`}>
          <Card title="Último mês" time={lastMonth} />
        </Link>
      </div>
    </>
  );
}

function getSummaryInterval(from: Date, to: Date) {
  return {
    from: zonedTimeToUtc(from, "America/Sao_Paulo"),
    to: zonedTimeToUtc(to, "America/Sao_Paulo"),
  };
}

