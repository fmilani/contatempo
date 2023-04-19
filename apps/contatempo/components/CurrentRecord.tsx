"use client";

import { Record } from "@/lib/api";
import { zeroPad } from "@/lib/helpers";
import useInterval from "@/lib/hooks/useInterval";
import intervalToDuration from "date-fns/intervalToDuration";
import { Loader2, PlayCircle, StopCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CurrentRecordProps {
  record?: Record;
  initialNow: string;
}
function Duration({ duration }) {
  return (
    <span className="py-4 pr-4">
      {duration.hours}:{zeroPad(duration.minutes)}:{zeroPad(duration.seconds)}
    </span>
  );
}

export default function CurrentRecord({
  record,
  initialNow,
}: CurrentRecordProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(record);
  const [now, setNow] = useState<Date>(new Date(initialNow));

  useInterval(() => setNow(new Date()), 500);

  return (
    <div
      className={`rounded-xl drop-shadow-sm bg-white inline-flex items-center ${
        currentRecord ? "w-full overflow-hidden" : "w-14"
      } transition-all duration-500`}
    >
      <button
        disabled={isSaving}
        className="p-4"
        onClick={async () => {
          setIsSaving(true);
          if (currentRecord) {
            setCurrentRecord(undefined);
            const response = await fetch(`/api/records/${currentRecord.id}`, {
              method: "PUT",
              body: JSON.stringify({
                ...currentRecord,
                end: new Date().toISOString(),
              }),
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (response.status !== 200) {
              // TODO: user feedback
              setCurrentRecord(currentRecord);
            }
          } else {
            const newDate = new Date().toISOString();
            setCurrentRecord({ id: "optmistic-new-record", begin: newDate });
            try {
              const newRecord = await fetch(`/api/records`, {
                method: "POST",
                body: JSON.stringify({ begin: newDate }),
                headers: {
                  "Content-Type": "application/json",
                },
              }).then((r) => r.json());
              setCurrentRecord(newRecord);
            } catch (e) {
              // TODO: user feedback
              setCurrentRecord(undefined);
            }
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
          <PlayCircle />
        )}
      </button>
      {currentRecord && now && (
        <Duration
          duration={intervalToDuration({
            start: new Date(currentRecord.begin),
            end: now,
          })}
        />
      )}
    </div>
  );
}
