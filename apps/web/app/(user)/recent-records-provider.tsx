"use client";

import { createContext, ReactNode, startTransition, useContext } from "react";
import { Record } from "@/lib/db/schema";
import useSWR from "swr";
import { startRecording, stopRecording } from "./actions";

type StartRecordingAction = { type: "start-recording"; date: Date };
type StopRecordingAction = {
  type: "stop-recording";
  date: Date;
  recordId: number;
};
type Action = StartRecordingAction | StopRecordingAction;
type RecentRecordsContextType = {
  recentRecords: Record[];
  update: (action: Action) => void;
};
const RecentRecordsContext = createContext<RecentRecordsContextType | null>(
  null,
);
function reducer(state: Record[], action: Action) {
  switch (action.type) {
    case "start-recording": {
      return [
        {
          start: action.date,
          end: null,
          description: null,
          id: 0,
          userId: 0,
        },
        ...state,
      ];
    }
    case "stop-recording": {
      return state.map((record) =>
        record.id === action.recordId
          ? { ...record, end: action.date ?? null }
          : record,
      );
    }
  }
}
const fetcher = async (url: string) => {
  const r = await fetch(url);
  const records: Record[] = await r.json();
  return records.map((record) => ({
    ...record,
    start: new Date(record.start),
    end: record.end ? new Date(record.end) : null,
  }));
};
export function RecentRecordsProvider({ children }: { children: ReactNode }) {
  const { data, mutate } = useSWR<Record[]>("/api/recent-records", fetcher);
  const records = data!;
  function update(action: Action) {
    startTransition(async () => {
      const updatedRecords = reducer(records, action);
      mutate(updatedRecords, { revalidate: false });

      switch (action.type) {
        case "start-recording": {
          const result = await startRecording({ start: action.date });
          const updatedRecordsAfterAction = updatedRecords.map((record) => {
            if (record.id === 0) {
              return result.record;
            }
            return record;
          });
          mutate(updatedRecordsAfterAction, false);
          return;
        }
        case "stop-recording": {
          const result = await stopRecording({
            end: action.date,
            recordId: action.recordId,
          });
          const updatedRecordsAfterAction = updatedRecords.map((record) => {
            if (record.id === action.recordId) {
              return result.record;
            }
            return record;
          });
          mutate(updatedRecordsAfterAction, false);
          return;
        }
      }
    });
  }
  return (
    <RecentRecordsContext.Provider value={{ recentRecords: records, update }}>
      {children}
    </RecentRecordsContext.Provider>
  );
}

export function useRecentRecords() {
  const ctx = useContext(RecentRecordsContext);
  if (!ctx)
    throw new Error(
      "useRecentRecords must be used inside RecentRecordsProvider",
    );
  return ctx;
}
