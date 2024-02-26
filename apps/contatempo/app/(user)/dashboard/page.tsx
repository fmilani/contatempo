import { getSummary } from "@/lib/api";
import getTimezoneOffset from "date-fns-tz/getTimezoneOffset";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import sub from "date-fns/sub";
import Link from "next/link";
import { buildRangeQueryParams } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimeFormat from "@/components/TimeFormat";

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
          <Card>
            <CardHeader>
              <CardTitle>Hoje</CardTitle>
            </CardHeader>
            <CardContent><TimeFormat time={today} /></CardContent>
          </Card>
        </Link>
        <Link href={`/records?${buildRangeQueryParams({ from: som, to: eom })}`}>
          <Card>
            <CardHeader>
              <CardTitle>Esse mês</CardTitle>
            </CardHeader>
            <CardContent><TimeFormat time={thisMonth} /></CardContent>
          </Card>
        </Link>
        <Link href={`/records?${buildRangeQueryParams({ from: solm, to: eolm })}`}>
          <Card>
            <CardHeader>
              <CardTitle>Último mês</CardTitle>
            </CardHeader>
            <CardContent><TimeFormat time={lastMonth} /></CardContent>
          </Card>
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

