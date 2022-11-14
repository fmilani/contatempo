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
  return (
    <div>
      <button
        className="p-4"
        onClick={async () => {
          setIsSaving(true);
          if (record) {
            await fetch(`/api/records/${record.id}`, {
              method: "PUT",
              body: JSON.stringify({
                begin: record.begin,
                end: new Date(),
              }),
              headers: {
                "Content-Type": "application/json",
              },
            });
          } else {
            await fetch(`/api/records`, {
              method: "POST",
              body: JSON.stringify({ begin: new Date() }),
              headers: {
                "Content-Type": "application/json",
              },
            });
          }
          setIsSaving(false);
          router.refresh();
        }}
      >
        {isSaving ? (
          <Loader2 className="animate-spin" />
        ) : record ? (
          <StopCircle />
        ) : (
          <Play />
        )}
      </button>
    </div>
  );
}
