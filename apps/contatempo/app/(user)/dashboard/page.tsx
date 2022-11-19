import { getSummary } from "@/lib/api";
import { zeroPad } from "@/lib/helpers";
import getTimezoneOffset from "date-fns-tz/getTimezoneOffset";
import zonedTimeToUtc from "date-fns-tz/zonedTimeToUtc";
import endOfDay from "date-fns/endOfDay";
import endOfMonth from "date-fns/endOfMonth";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
import startOfMonth from "date-fns/startOfMonth";
import sub from "date-fns/sub";
import Link from "next/link";

export default async function DashboardPage() {
  const todayOffseted = sub(new Date(), {
    seconds:
      (getTimezoneOffset(process.env.TZ) -
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
    <div>
      <p className="text-xl font-bold mb-8">Dashboard</p>
      <Link href={`/records?${buildQueryParams({ from: sot, to: eot })}`}>
        <Card title="Hoje" time={today} />
      </Link>
      <div className="mt-4 grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Link href={`/records?${buildQueryParams({ from: som, to: eom })}`}>
          <Card title="Esse mês" time={thisMonth} />
        </Link>
        <Link href={`/records?${buildQueryParams({ from: solm, to: eolm })}`}>
          <Card title="Último mês" time={lastMonth} />
        </Link>
      </div>
    </div>
  );
}

function getSummaryInterval(from: Date, to: Date) {
  return {
    from: zonedTimeToUtc(from, "America/Sao_Paulo"),
    to: zonedTimeToUtc(to, "America/Sao_Paulo"),
  };
}

function buildQueryParams({ from, to }) {
  return new URLSearchParams({
    from: format(from, "yyyy-MM-dd"),
    to: format(to, "yyyy-MM-dd"),
  });
}

function Card({ title, time }) {
  const h = Math.floor(time / 3600);
  const m = Math.floor((time % 3600) / 60);
  const s = (time % 3600) % 60;
  return (
    <div className="rounded-lg drop-shadow-sm bg-white p-4 hover:bg-slate-200">
      <div className="font-bold text-lg">{title}</div>
      <div className="">{`${zeroPad(h)}h ${zeroPad(m)}m ${zeroPad(s)}s`}</div>
    </div>
  );
}
