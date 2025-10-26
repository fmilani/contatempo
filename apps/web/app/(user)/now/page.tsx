import { Suspense } from "react";
import { Records } from "./records";
import { RecentRecordsProvider } from "@/app/(user)/recent-records-provider";

export default function Page() {
  return (
    <Suspense fallback="loading recent records...">
      <RecentRecordsProvider>
        <Records />
      </RecentRecordsProvider>
    </Suspense>
  );
}
