import { Record } from "@/lib/api";
import {PlayCircle, StopCircle } from "lucide-react";
import Duration from "./Duration";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { startStopRecord } from "../actions";

interface CurrentRecordProps {
  record?: Record;
  now: Date;
  setOptimisticRecords: any;
}

export default function CurrentRecord({
  record,
  now,
  setOptimisticRecords,
}: CurrentRecordProps) {
  return (
      <Card
        className={cn(
          "overflow-hidden",
          record && "w-full",
        )}
      >
        <CardHeader className="p-2">
      <form
        action={async () => {
          const time = new Date();
          setOptimisticRecords({action: 'edit', newRecord: record, time})
          await startStopRecord(record, time);
        }}
      >
          <div
            className={cn(
              "flex items-center gap-2",
            )}
          >
            <Button
              type="submit"
              variant="ghost"
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
      </form>
        </CardHeader>
      </Card>
  );
}
