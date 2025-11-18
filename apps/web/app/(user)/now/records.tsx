"use client";

import { startTransition, useEffect } from "react";
import { RecordWithTags } from "@/lib/db/schema";
import { N_RECENT_RECORDS } from "@/lib/constants";
import { useRecentRecords } from "../recent-records-provider";
import { useRouter, useSearchParams } from "next/navigation";

export function Records() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recentRecords, update } = useRecentRecords();
  const ongoingRecord = recentRecords.find(
    (record: RecordWithTags) => !record.end,
  );
  const autostart = searchParams.get("autostart") === "1";
  useEffect(() => {
    if (autostart && !ongoingRecord) {
      startTransition(() => {
        router.replace("?autostart=0");
        update({ type: "start-recording", date: new Date() });
      });
    }
  }, [autostart, ongoingRecord, router, update]);
  return (
    <div className="flex flex-col gap-2 items-center">
      <ul>
        {recentRecords
          .filter((record) => record.end)
          .map((record) => (
            <li key={record.id}>
              {record.start.toLocaleTimeString()} -{" "}
              {record.end?.toLocaleTimeString()}: {record.description}(
              {record.tags.map((tag) => tag.name).join(", ")})
            </li>
          ))
          .slice(0, N_RECENT_RECORDS)}
      </ul>
    </div>
  );
}
