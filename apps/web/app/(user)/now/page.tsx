import { Suspense } from "react";
import { getRecentRecords } from "@/lib/db/queries";
import { Records } from "./records";

export default function Page() {
  return (
    <div>
      <Suspense fallback="loading recent records...">
        <RecentRecords />
      </Suspense>
    </div>
  );
}

async function RecentRecords() {
  const recentRecords = await getRecentRecords();
  return <Records records={recentRecords} />;
}
