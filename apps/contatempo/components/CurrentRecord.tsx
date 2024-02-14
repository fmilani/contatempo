"use client";

import { Record } from "@/lib/api";
import {PlayCircle, StopCircle } from "lucide-react";
import Duration from "./Duration";
import { Button } from "@/components/ui/button";

interface CurrentRecordProps {
  record?: Record;
  now: Date;
}

export default function CurrentRecord({
  record,
  now,
}: CurrentRecordProps) {
  return (
    <div
      className={`inline-flex items-center gap-2`}
    >
      <Button
        type="submit"
        variant="outline"
        size="icon"
      >
        {record ? (
          <StopCircle />
        ) : (
          <PlayCircle />
        )}
      </Button>
      {record && now &&
        <Duration
          records={[{ begin: record.begin, end: now }]}
          now={now}
        />
      }
    </div>
  );
}
