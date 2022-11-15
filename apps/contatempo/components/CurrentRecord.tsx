"use client";

import { Record } from "@/lib/api";
import useInterval from "@/lib/hooks/useInterval";
import formatDuration from "date-fns/formatDuration";
import intervalToDuration from "date-fns/intervalToDuration";
import { Loader2, Play, StopCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CurrentRecordProps {
  record?: Record;
}
export default function CurrentRecord({ record }: CurrentRecordProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(record);
  const [now, setNow] = useState<Date>();
  useInterval(() => setNow(new Date()), 1000);
  // useEffect(() => {
  //   setNow(new Date());
  // }, []);
  return (
    <div>
      {currentRecord &&
        now &&
        formatDuration(
          intervalToDuration({
            start: new Date(currentRecord.begin),
            end: now,
          })
        )}
      <button
        disabled={isSaving}
        className="p-4"
        onClick={async () => {
          setIsSaving(true);
          if (currentRecord) {
            setCurrentRecord(null);
            await fetch(`/api/records/${currentRecord.id}`, {
              method: "PUT",
              body: JSON.stringify({
                ...currentRecord,
                end: new Date().toISOString(),
              }),
              headers: {
                "Content-Type": "application/json",
              },
            });
          } else {
            const newRecord = await fetch(`/api/records`, {
              method: "POST",
              body: JSON.stringify({ id: "", begin: new Date().toISOString() }),
              headers: {
                "Content-Type": "application/json",
              },
            }).then((r) => r.json());
            setCurrentRecord(newRecord);
          }
          setIsSaving(false);
          router.refresh();
        }}
      >
        {isSaving ? (
          <Loader2 className="animate-spin" />
        ) : currentRecord ? (
          <StopCircle />
        ) : (
          <Play />
        )}
      </button>
    </div>
  );
}
