"use client";

import { createContext, ReactNode, useContext, useTransition } from "react";
import { RecordWithTags, Tag } from "@/lib/db/schema";
import useSWR from "swr";
import {
  startRecording,
  stopRecording,
  updateRecordDescription,
  updateRecordTags,
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
type UpdateTagsAction = {
  type: "update-tags";
  recordId: number;
  tags: Tag[];
};
type Action =
  | StartRecordingAction
  | StopRecordingAction
  | UpdateDescriptionAction
  | UpdateTagsAction;
type RecentRecordsContextType = {
  recentRecords: RecordWithTags[];
  update: (action: Action) => void;
  startRecordingIsPending: boolean;
  stopRecordingIsPending: boolean;
  updateDescriptionIsPending: boolean;
  updateTagsIsPending: boolean;
};
const RecentRecordsContext = createContext<RecentRecordsContextType | null>(
  null,
);
function reducer(state: RecordWithTags[], action: Action) {
  switch (action.type) {
    case "start-recording": {
      return [
        {
          start: action.date,
          end: null,
          description: null,
          tags: [],
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
    case "update-tags": {
      return state.map((record) =>
        record.id === action.recordId
          ? { ...record, tags: action.tags }
          : record,
      );
    }
  }
}
const fetcher = async (url: string) => {
  const r = await fetch(url);
  const records: RecordWithTags[] = await r.json();
  return records.map((record) => ({
    ...record,
    start: new Date(record.start),
    end: record.end ? new Date(record.end) : null,
  }));
};
export function RecentRecordsProvider({ children }: { children: ReactNode }) {
  const { data, mutate } = useSWR<RecordWithTags[]>(
    "/api/recent-records",
    fetcher,
  );
  const [startRecordingIsPending, startStartRecordingTransition] =
    useTransition();
  const [stopRecordingIsPending, startStopRecordingTransition] =
    useTransition();
  const [updateDescriptionIsPending, startUpdateDescriptionTransition] =
    useTransition();
  const [updateTagsIsPending, startUpdateTagsTransition] = useTransition();
  const records = data!;
  function update(action: Action) {
    const updatedRecords = reducer(records, action);
    mutate(updatedRecords, { revalidate: false });

    switch (action.type) {
      case "start-recording": {
        startStartRecordingTransition(async () => {
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
        });
        return;
      }
      case "stop-recording": {
        startStopRecordingTransition(async () => {
          await stopRecording({
            end: action.date,
            recordId: action.recordId,
          });
        });
        return;
      }
      case "update-description": {
        startUpdateDescriptionTransition(async () => {
          await updateRecordDescription({
            recordId: action.recordId,
            description: action.description,
          });
        });
        return;
      }
      case "update-tags": {
        startUpdateTagsTransition(async () => {
          await updateRecordTags({
            recordId: action.recordId,
            tags: action.tags.map((tag) => tag.id),
          });
        });
        return;
      }
    }
  }
  return (
    <RecentRecordsContext.Provider
      value={{
        recentRecords: records,
        update,
        startRecordingIsPending,
        stopRecordingIsPending,
        updateDescriptionIsPending,
        updateTagsIsPending,
      }}
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
