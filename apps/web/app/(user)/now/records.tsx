"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { Record, RecordWithTags } from "@/lib/db/schema";
import { N_RECENT_RECORDS } from "@/lib/constants";
import { useRecentRecords } from "../recent-records-provider";
import { useRouter, useSearchParams } from "next/navigation";
import {
  differenceInSeconds,
  Duration,
  format,
  formatDuration,
} from "date-fns";
import { Calendar, Clock } from "lucide-react";
import { TagBadge } from "./tag-badge";
import { useKeyPressEvent } from "@/lib/hooks";
import { Input } from "@/components/ui/input";

export function Records() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { recentRecords, update } = useRecentRecords();
  useKeyPressEvent("c", () => {
    const allDetails = document.getElementsByTagName("details");
    let atLeastOneOpen = false;
    for (const details of allDetails) {
      if (details.open) {
        atLeastOneOpen = true;
        break;
      }
    }
    for (const details of allDetails) {
      details.open = !atLeastOneOpen;
    }
  });
  const ongoingRecord = recentRecords.find(
    (record: RecordWithTags) => !record.end,
  );
  const autostart = searchParams.get("autostart") === "1";
  useEffect(() => {
    if (autostart && !ongoingRecord) {
      startTransition(() => {
        router.replace("?autostart=0");
        update({ type: "start-recording", date: new Date() });
      });
    }
  }, [autostart, ongoingRecord, router, update]);
  const recordsGroups = groupRecordsByDay(
    recentRecords.filter((r) => r.end).slice(0, N_RECENT_RECORDS),
  );
  return (
    <div className="max-w-lg relative pl-6">
      <div className="absolute left-3 top-0 bottom-10 bg-border w-0.25" />
      <div className="space-y-6">
        {Object.entries(recordsGroups).map(([key, records]) => {
          return (
            <details open key={key} className="relative">
              <summary className="sticky top-0 z-20 backdrop-blur-sm mb-2 leading-7 list-none cursor-pointer">
                <div className="relative">
                  <div className="absolute left-[-1.5rem] top-0.5 w-6 h-6 bg-background rounded-full flex items-center justify-center z-10">
                    <Calendar className="text-primary w-5 h-5" />
                  </div>
                  <div className="flex min-h-6 items-start justify-between ml-2 pt-0.5">
                    <span className="font-semibold font-mono">
                      {formatDate(records[0].start)}
                    </span>
                    <RecordsGroupDuration records={records} />
                  </div>
                </div>
              </summary>

              <div className="space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="relative">
                    <div className="absolute left-[-1.5rem] top-0.5 w-6 h-6 rounded-full flex items-center justify-center z-10">
                      <Clock className="text-primary h-4 w-4 bg-gray-50" />
                    </div>

                    <div className="ml-2 flex flex-col gap-1">
                      <div className="flex min-h-6 items-baseline gap-2">
                       <div className="flex-1 flex flex-col sm:flex-row sm:gap-1">
                         <div>
                            <RecordTime
                              recordId={record.id}
                              field="start"
                              time={record.start}
                            />{" "}
                            –
                            {record.end && (
                              <RecordTime
                                recordId={record.id}
                                field="end"
                                time={record.end}
                              />
                            )}
                          </div>
                          <div className="flex-1 flex flex-wrap gap-1">
                            {record.tags.length > 0 ? (
                              record.tags.map((tag) => (
                                <TagBadge key={tag.id} tag={tag}>
                                  {tag.name}
                                </TagBadge>
                              ))
                            ) : (
                              <TagBadge>+ tag</TagBadge>
                            )}
                          </div>
                        </div>
                        <RecordDuration record={record} />
                      </div>

                      <p className="flex-1 text-muted-foreground text-sm text-ellipsis overflow-hidden whitespace-nowrap">
                        {record.description || <i>(no description)</i>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function RecordTime({
  recordId,
  field,
  time,
}: {
  recordId: number;
  field: "start" | "end";
  time: Date;
}) {
  const { update } = useRecentRecords();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(format(time, "HH:mm:ss"));
  const inputRef = useRef<HTMLInputElement>(null);
  const skipNextCommitRef = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      setValue(format(time, "HH:mm:ss"));
    }
  }, [isEditing, time]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commit() {
    if (skipNextCommitRef.current) {
      skipNextCommitRef.current = false;
      return;
    }

    const nextTime = parseTimeValue(value, time);
    setIsEditing(false);

    if (!nextTime) {
      setValue(format(time, "HH:mm:ss"));
      return;
    }

    if (nextTime.getTime() !== time.getTime()) {
      update({ type: "update-time", recordId, field, time: nextTime });
    }
  }

  function cancel() {
    skipNextCommitRef.current = true;
    setValue(format(time, "HH:mm:ss"));
    setIsEditing(false);
    setTimeout(() => {
      skipNextCommitRef.current = false;
    }, 0);
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type="time"
        step="1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }

          if (event.key === "Escape") {
            event.preventDefault();
            cancel();
          }
        }}
        className="h-6 w-[6.75rem] px-1 py-0 font-mono appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        aria-label={`Edit ${field} time`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="inline-flex items-baseline rounded-sm font-mono text-sm whitespace-nowrap leading-none hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`Edit ${field} time ${format(time, "HH:mm:ss")}`}
    >
      {format(time, "HH:mm")}
      <span className="font-normal text-xs text-muted-foreground">
        {format(time, ":ss")}
      </span>
    </button>
  );
}

function parseTimeValue(value: string, baseDate: Date) {
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) {
    return null;
  }

  const [, hoursValue, minutesValue, secondsValue = "0"] = match;
  const hours = Number(hoursValue);
  const minutes = Number(minutesValue);
  const seconds = Number(secondsValue);
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null;
  }

  const nextTime = new Date(baseDate);
  nextTime.setHours(hours, minutes, seconds, 0);
  return nextTime;
}

function RecordDuration({ record }: { record: RecordWithTags }) {
  const { hours, minutes, seconds } = calculateRecordDuration(record);
  return (
    <span className="font-mono text-sm whitespace-nowrap">
      <span>{formatRecordDuration({ hours, minutes })}</span>
      <span className="text-xs text-muted-foreground">
        {formatRecordDuration({ seconds })}
      </span>
    </span>
  );
}

function RecordsGroupDuration({ records }: { records: Record[] }) {
  const { hours, minutes, seconds } = calculateRecordsGroupDuration(records);
  return (
    <div className="font-mono font-semibold">
      <span>{formatRecordDuration({ hours, minutes })}</span>
      <span className="text-sm text-muted-foreground">
        {formatRecordDuration({ seconds })}
      </span>
    </div>
  );
}
function groupRecordsByDay(records: RecordWithTags[]) {
  return records.reduce(
    (groups, record) => {
      const dateKey = format(record.start, "yyyy-MM-dd");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(record);
      return groups;
    },
    {} as { [key: string]: RecordWithTags[] },
  );
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

function calculateRecordDuration(record: Record) {
  const diffInSecs = differenceInSeconds(
    record.end ?? new Date(),
    record.start,
  );
  return {
    hours: Math.floor(diffInSecs / 3600),
    minutes: Math.floor((diffInSecs % 3600) / 60),
    seconds: diffInSecs % 60,
  };
}
function calculateRecordsGroupDuration(records: Record[]) {
  const diffInSecs = records
    .map((record) =>
      differenceInSeconds(record.end ?? new Date(), record.start),
    )
    .reduce((a, b) => a + b, 0);
  return {
    hours: Math.floor(diffInSecs / 3600),
    minutes: Math.floor((diffInSecs % 3600) / 60),
    seconds: diffInSecs % 60,
  };
}

function formatRecordDuration(duration: Duration) {
  const format = formatDuration(duration);
  return format
    .split(" ")
    .map((v, i) => {
      if (i % 2 === 0) {
        return v;
      }
      return v.at(0);
    })
    .join("");
}
