"use client";

import { useActionState, useOptimistic, useState } from "react";
import { Play, Square } from "lucide-react";
import { intervalToDuration } from "date-fns";
import { Button } from "@/components/ui/button";
import { startRecording, stopRecording } from "@/app/(user)/actions";
import { ActionState } from "@/lib/auth/middleware";
import { Record } from "@/lib/db/schema";
import { N_RECENT_RECORDS } from "@/lib/constants";
import { useInterval } from "@/lib/hooks";

type ActionType = "record";
type Action = { type: ActionType; date?: Date; record?: Record };
function reducer(state: Record[], action: Action) {
  switch (action.type) {
    case "record": {
      if (action.record) {
        return state.map((r) =>
          r.id === action.record?.id ? { ...r, end: action.date ?? null } : r,
        );
      }
      return [
        {
          start: action.date ?? new Date(),
          end: null,
          description: null,
          id: 0,
          userId: 0,
        },
        ...state,
      ];
    }
  }
}
export function Records({ records }: { records: Record[] }) {
  const [optimisticRecords, updateOptimisticRecords] = useOptimistic<
    Record[],
    Action
  >(records, reducer);
  const ongoingRecord = optimisticRecords.find((record: Record) => !record.end);
  return (
    <div className="flex flex-col gap-2 items-center">
      <div className="p-2 border rounded-full flex gap-1 items-center">
        {ongoingRecord ? (
          <StopRecording
            record={ongoingRecord}
            onStop={(date) => {
              updateOptimisticRecords({
                type: "record",
                record: ongoingRecord,
                date,
              });
            }}
          />
        ) : (
          <StartRecording
            onStart={(date) => {
              updateOptimisticRecords({ type: "record", date });
            }}
          />
        )}
        {ongoingRecord && <OngoingDuration ongoingRecord={ongoingRecord} />}
      </div>
      <ul>
        {optimisticRecords
          .filter((record) => record.end)
          .map((record) => (
            <li key={record.id}>
              {record.start.toLocaleTimeString()} -{" "}
              {record.end?.toLocaleTimeString()}
            </li>
          ))
          .slice(0, N_RECENT_RECORDS)}
      </ul>
    </div>
  );
}

function StartRecording({ onStart }: { onStart: (date: Date) => void }) {
  const [_, startRecordingAction, __] = useActionState<ActionState, FormData>(
    startRecording,
    {},
  );
  return (
    <form
      action={async () => {
        const date = new Date();
        const formData = new FormData();
        formData.set("start", date.toISOString());
        onStart(date);
        startRecordingAction(formData);
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
  const [_, stopRecordingAction, __] = useActionState<ActionState, FormData>(
    stopRecording,
    {},
  );
  return (
    <form
      action={async () => {
        const date = new Date();
        const formData = new FormData();
        formData.set("end", date.toISOString());
        formData.set("recordId", record.id.toString());
        onStop(date);
        stopRecordingAction(formData);
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
