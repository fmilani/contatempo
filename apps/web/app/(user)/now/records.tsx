"use client";

import { startTransition, Suspense, useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { intervalToDuration } from "date-fns";
import { Button } from "@/components/ui/button";
import { Record } from "@/lib/db/schema";
import { N_RECENT_RECORDS } from "@/lib/constants";
import { useInterval, useKeyPressEvent } from "@/lib/hooks";
import {
  RecentRecordsProvider,
  useRecentRecords,
} from "../recent-records-provider";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

export function Records() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recentRecords, update } = useRecentRecords();
  const ongoingRecord = recentRecords.find((record: Record) => !record.end);
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
              {record.end?.toLocaleTimeString()}: {record.description}
            </li>
          ))
          .slice(0, N_RECENT_RECORDS)}
      </ul>
    </div>
  );
}
export function RecordingContainer() {
  const pathname = usePathname();
  if (pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up")
    return null;
  return (
    <Suspense fallback="waaat">
      <RecentRecordsProvider>
        <Recording />
      </RecentRecordsProvider>
    </Suspense>
  );
}
function Recording() {
  const { recentRecords, update } = useRecentRecords();
  const ongoingRecord = recentRecords.find((record: Record) => !record.end);
  return (
    <div
      className={cn(
        "border rounded-full flex gap-4 items-center",
        ongoingRecord && "pr-3 flex-1",
      )}
    >
      {ongoingRecord ? (
        <StopRecording
          record={ongoingRecord}
          onStop={(date) => {
            update({
              type: "stop-recording",
              recordId: ongoingRecord.id,
              date,
            });
          }}
        />
      ) : (
        <StartRecording
          onStart={(date) => {
            update({ type: "start-recording", date });
          }}
        />
      )}
      {ongoingRecord && <OngoingDuration ongoingRecord={ongoingRecord} />}
      {ongoingRecord && <DescriptionForm ongoingRecord={ongoingRecord} />}
    </div>
  );
}

function DescriptionForm({ ongoingRecord }: { ongoingRecord: Record }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { update } = useRecentRecords();
  return (
    <form
      className="flex-1"
      action={(formData) => {
        if (!ongoingRecord.id) {
          alert("pera");
          return;
        }
        update({
          type: "update-description",
          recordId: ongoingRecord.id,
          description: formData.get("description")?.toString() ?? "",
        });
        console.log("desc form");
        inputRef.current?.blur();
      }}
    >
      <Input
        className="border-none"
        placeholder="what are working on?"
        ref={inputRef}
        autoFocus={!ongoingRecord.description}
        name="description"
        defaultValue={ongoingRecord.description ?? ""}
      />
    </form>
  );
}

function StartRecording({ onStart }: { onStart: (date: Date) => void }) {
  const form = useRef<HTMLFormElement>(null);
  useKeyPressEvent("s", (event) => {
    event.preventDefault();
    form.current?.requestSubmit();
  });
  return (
    <form
      ref={form}
      action={async () => {
        onStart(new Date());
      }}
    >
      <Button variant="ghost" size="icon-lg" className="rounded-full">
        <Play />
      </Button>
    </form>
  );
}

function StopRecording({
  record,
  onStop,
}: {
  record: Record;
  onStop: (date: Date) => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  useKeyPressEvent("s", (event) => {
    event.preventDefault();
    form.current?.requestSubmit();
  });
  return (
    <form
      ref={form}
      action={async () => {
        onStop(new Date());
      }}
    >
      <Button
        variant="ghost"
        size="icon-lg"
        className="rounded-full"
        disabled={!record.id}
      >
        <Square />
      </Button>
    </form>
  );
}

function OngoingDuration({ ongoingRecord }: { ongoingRecord: Record }) {
  const [now, setNow] = useState(new Date());
  useInterval(() => setNow(new Date()), 500);
  const duration = intervalToDuration({ start: ongoingRecord.start, end: now });
  if (duration.hours) {
    duration.hours += (duration.days ?? 0) * 24;
  }
  return (
    <span className="font-mono">
      {duration.hours?.toString().padStart(2, "0") ?? "00"}:
      {duration.minutes?.toString().padStart(2, "0") ?? "00"}
      <span className="text-[0.8em] text-gray-500">
        :{duration.seconds?.toString().padStart(2, "0") ?? "00"}
      </span>
    </span>
  );
}
