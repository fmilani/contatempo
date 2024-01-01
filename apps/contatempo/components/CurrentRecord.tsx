"use client";

import { Record } from "@/lib/api";
import useInterval from "@/lib/hooks/useInterval";
import { Loader2, PlayCircle, StopCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Duration from "./Duration";

interface CurrentRecordProps {
  record?: Record;
  initialNow: string;
}

export default function CurrentRecord({
  record,
  now,
}: CurrentRecordProps) {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div
      className={`rounded-xl drop-shadow-sm bg-white inline-flex items-center ${
        record ? "w-full overflow-hidden" : "w-14"
      } transition-all duration-500`}
    >
      <button
        type="submit"
        disabled={isSaving}
        className="p-4"
      >
        {isSaving ? (
          <Loader2 className="animate-spin" />
        ) : record ? (
          <StopCircle />
        ) : (
          <PlayCircle />
        )}
      </button>
      {record && now && (
        <Duration records={[{ begin: record.begin, end: now }]} />
      )}
    </div>
  );
}
