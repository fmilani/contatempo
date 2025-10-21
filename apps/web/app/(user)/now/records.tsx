"use client";

import { useActionState, useOptimistic } from "react";
import { Play, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startRecording, stopRecording } from "@/app/(user)/actions";
import { ActionState } from "@/lib/auth/middleware";
import { Record } from "@/lib/db/schema";

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
      ].slice(0, -1);
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
    <div>
      <ul>
        {optimisticRecords.map((record) => (
          <li>
            {record.start.toLocaleTimeString()} -{" "}
            {record.end?.toLocaleTimeString()}
          </li>
        ))}
      </ul>
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
      <Button size="icon-lg">
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
      <Button size="icon-lg" disabled={!record.id}>
        <StopCircle />
      </Button>
    </form>
  );
}
