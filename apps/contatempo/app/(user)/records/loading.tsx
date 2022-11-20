export default function Loading() {
  return (
    <div>
      <div className="rounded-lg drop-shadow-sm bg-white inline-flex p-4">
        <div className="h-6 w-6 animate-pulse rounded-lg bg-slate-200"></div>
      </div>
      <p className="text-xl font-bold my-8">Registros</p>
      <div className="h-6 w-32 animate-pulse rounded-lg bg-slate-200 mb-2"></div>
      <ul className="rounded-lg drop-shadow-sm bg-white divide divide-y">
        <li className="p-4">
          <div className="h-6 w-36 animate-pulse rounded-lg bg-slate-200"></div>
        </li>
        <li className="p-4">
          <div className="h-6 w-36 animate-pulse rounded-lg bg-slate-200"></div>
        </li>
        <li className="p-4">
          <div className="h-6 w-36 animate-pulse rounded-lg bg-slate-200"></div>
        </li>
      </ul>
    </div>
  );
}
