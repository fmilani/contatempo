"use client";

import { createContext, ReactNode, useContext, useTransition } from "react";
import { Record } from "@/lib/db/schema";
import useSWR from "swr";
import {
  startRecording,
  stopRecording,
  updateRecordDescription,
} from "./actions";

type StartRecordingAction = { type: "start-recording"; date: Date };
type StopRecordingAction = {
  type: "stop-recording";
  date: Date;
  recordId: number;
};
type UpdateDescriptionAction = {
  type: "update-description";
  recordId: number;
  description: string;
};
type Action =
  | StartRecordingAction
  | StopRecordingAction
  | UpdateDescriptionAction;
type RecentRecordsContextType = {
  recentRecords: Record[];
  update: (action: Action) => void;
  updateIsPending: boolean;
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
    case "update-description": {
      return state.map((record) =>
        record.id === action.recordId
          ? { ...record, description: action.description }
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
  const [isPending, startTransition] = useTransition();
  const records = data!;
  function update(action: Action) {
    startTransition(async () => {
      const updatedRecords = reducer(records, action);
      mutate(updatedRecords, { revalidate: false });

      switch (action.type) {
        case "start-recording": {
          const result = await startRecording({ start: action.date });
          if (!result.record) {
            return;
          }
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
          await stopRecording({
            end: action.date,
            recordId: action.recordId,
          });
          return;
        }
        case "update-description": {
          await updateRecordDescription({
            recordId: action.recordId,
            description: action.description,
          });
          return;
        }
      }
    });
  }
  return (
    <RecentRecordsContext.Provider
      value={{ recentRecords: records, update, updateIsPending: isPending }}
    >
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
