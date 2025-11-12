"use client";

import { startTransition, Suspense, useEffect, useRef, useState } from "react";
import { Loader, Loader2, Play, Square } from "lucide-react";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

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
  const { recentRecords } = useRecentRecords();
  const ongoingRecord = recentRecords.find((record: Record) => !record.end);
  return (
    <div
      className={cn(
        "border rounded-full flex gap-4 items-center",
        ongoingRecord && "pr-3 flex-1",
      )}
    >
      {ongoingRecord ? (
        <StopRecording record={ongoingRecord} />
      ) : (
        <StartRecording />
      )}
      {ongoingRecord && <OngoingDuration ongoingRecord={ongoingRecord} />}
      {ongoingRecord && <DescriptionForm ongoingRecord={ongoingRecord} />}
    </div>
  );
}

function DescriptionForm({ ongoingRecord }: { ongoingRecord: Record }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { update, updateDescriptionIsPending } = useRecentRecords();
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
      <InputGroup className="border-none">
        <InputGroupInput
          placeholder="what are you working on?"
          ref={inputRef}
          autoFocus={!ongoingRecord.description}
          name="description"
          defaultValue={ongoingRecord.description ?? ""}
        />
        {updateDescriptionIsPending && (
          <InputGroupAddon align="inline-end">
            <Loader2 className="animate-spin" />
          </InputGroupAddon>
        )}
      </InputGroup>
    </form>
  );
}

function StartRecording() {
  const form = useRef<HTMLFormElement>(null);
  useKeyPressEvent("s", (event) => {
    event.preventDefault();
    form.current?.requestSubmit();
  });
  const { update } = useRecentRecords();
  return (
    <form
      ref={form}
      action={async () => {
        update({ type: "start-recording", date: new Date() });
      }}
    >
      <Button variant="ghost" size="icon-lg" className="rounded-full">
        <Play />
      </Button>
    </form>
  );
}

function StopRecording({ record }: { record: Record }) {
  const form = useRef<HTMLFormElement>(null);
  useKeyPressEvent("s", (event) => {
    event.preventDefault();
    form.current?.requestSubmit();
  });
  const { update } = useRecentRecords();
  return (
    <form
      ref={form}
      action={async () => {
        update({
          type: "stop-recording",
          recordId: record.id,
          date: new Date(),
        });
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
