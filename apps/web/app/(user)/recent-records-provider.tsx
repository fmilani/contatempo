"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useRef,
  useTransition,
} from "react";
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

type TransitionStarter = (callback: () => void) => void;

function reducer(
  state: RecordWithTags[],
  action: Action,
  temporaryRecordId = 0,
) {
  switch (action.type) {
    case "start-recording": {
      return [
        {
          start: action.date,
          end: null,
          description: null,
          tags: [],
          id: temporaryRecordId,
          userId: 0,
        },
        ...state,
      ];
    }
    case "stop-recording": {
      return state.map((record) =>
        record.id === action.recordId
          ? { ...record, end: action.date }
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

function patchRecord(
  state: RecordWithTags[],
  recordId: number,
  patch: Partial<RecordWithTags>,
) {
  return state.map((record) =>
    record.id === recordId ? { ...record, ...patch } : record,
  );
}

function rollbackRecordField<K extends keyof RecordWithTags>(
  state: RecordWithTags[],
  previousState: RecordWithTags[],
  recordId: number,
  field: K,
) {
  const previousRecord = previousState.find((record) => record.id === recordId);
  if (!previousRecord) {
    return state;
  }

  return patchRecord(state, recordId, { [field]: previousRecord[field] });
}

function removeTemporaryRecord(
  state: RecordWithTags[],
  temporaryRecordId: number,
) {
  return state.filter((record) => record.id !== temporaryRecordId);
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
  const nextTemporaryRecordId = useRef(-1);
  const [startRecordingIsPending, startStartRecordingTransition] =
    useTransition();
  const [stopRecordingIsPending, startStopRecordingTransition] =
    useTransition();
  const [updateDescriptionIsPending, startUpdateDescriptionTransition] =
    useTransition();
  const [updateTagsIsPending, startUpdateTagsTransition] = useTransition();
  const records = data ?? [];

  function runOptimisticMutation({
    apply,
    rollback,
    run,
    startTransition,
    errorMessage,
  }: {
    apply: (state: RecordWithTags[]) => RecordWithTags[];
    rollback: (
      state: RecordWithTags[],
      previousState: RecordWithTags[],
    ) => RecordWithTags[];
    run: () => Promise<void>;
    startTransition: TransitionStarter;
    errorMessage: string;
  }) {
    const previousRecords = records;

    void mutate((currentRecords) => apply(currentRecords ?? []), {
      revalidate: false,
    });

    startTransition(async () => {
      try {
        await run();
      } catch (error) {
        console.error(errorMessage, error);
        void mutate(
          (currentRecords) => rollback(currentRecords ?? [], previousRecords),
          false,
        );
      }
    });
  }

  function update(action: Action) {
    switch (action.type) {
      case "start-recording": {
        const temporaryRecordId = nextTemporaryRecordId.current;
        nextTemporaryRecordId.current -= 1;

        runOptimisticMutation({
          apply: (state) => reducer(state, action, temporaryRecordId),
          rollback: (state) => removeTemporaryRecord(state, temporaryRecordId),
          run: async () => {
            const result = await startRecording({ start: action.date });
            if (!result.record) {
              throw new Error("Missing record from startRecording");
            }

            await mutate(
              (currentRecords) =>
                patchRecord(
                  currentRecords ?? [],
                  temporaryRecordId,
                  result.record,
                ),
              false,
            );
          },
          startTransition: startStartRecordingTransition,
          errorMessage: "Failed to start recording",
        });
        return;
      }
      case "stop-recording": {
        runOptimisticMutation({
          apply: (state) => reducer(state, action),
          rollback: (state, previousState) =>
            rollbackRecordField(state, previousState, action.recordId, "end"),
          run: () =>
            stopRecording({
              end: action.date,
              recordId: action.recordId,
            }).then(() => undefined),
          startTransition: startStopRecordingTransition,
          errorMessage: "Failed to stop recording",
        });
        return;
      }
      case "update-description": {
        runOptimisticMutation({
          apply: (state) => reducer(state, action),
          rollback: (state, previousState) =>
            rollbackRecordField(
              state,
              previousState,
              action.recordId,
              "description",
            ),
          run: () =>
            updateRecordDescription({
              recordId: action.recordId,
              description: action.description,
            }).then(() => undefined),
          startTransition: startUpdateDescriptionTransition,
          errorMessage: "Failed to update description",
        });
        return;
      }
      case "update-tags": {
        runOptimisticMutation({
          apply: (state) => reducer(state, action),
          rollback: (state, previousState) =>
            rollbackRecordField(state, previousState, action.recordId, "tags"),
          run: () =>
            updateRecordTags({
              recordId: action.recordId,
              tags: action.tags
                .map((tag) => tag.id)
                .filter((tagId) => tagId > 0),
            }),
          startTransition: startUpdateTagsTransition,
          errorMessage: "Failed to update tags",
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
