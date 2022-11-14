"use client";

import { Record } from "@/lib/api";
import { Loader2, Play, StopCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CurrentRecordProps {
  record?: Record;
}
export default function CurrentRecord({ record }: CurrentRecordProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(record);
  return (
    <div>
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
