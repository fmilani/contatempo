"use client";

import React, { useOptimistic, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { Record } from "@/lib/api";
import ptbr from "date-fns/locale/pt-BR";
import Duration from "@/components/Duration";
import {
  differenceInCalendarDays,
  formatRelative,
} from "date-fns";
import CurrentRecord from "@/components/CurrentRecord";
import NewRecord from "@/components/NewRecord";
import {startStopRecord} from "../actions";
import useInterval from "@/lib/hooks/useInterval";
import RecordDetails from "@/components/RecordDetails";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecordsList({records}) {
  const [now, setNow] = useState<Date>(new Date());
  useInterval(() => setNow(new Date()), 500);
  const [optmisticRecords, setOptimisticRecords] = useOptimistic(records, (state: any, {action, newRecord, time}: any) => {
    if (action === 'delete') {
      return state.filter((record: Record) => record.id !== newRecord.id);
    } else {
      if (newRecord) {
        return state.map((record: Record) => record.id === newRecord.id ? {...record, end: time.toISOString()} : record)
        
      } else {
        return [{ id: "optmistic-new-record", begin: time.toISOString() }, ...state];
      }

    }
  });
  const currentRecord = optmisticRecords.find((record: Record) => !record.end);
  return (
    <div className="space-y-4">
        <div className="flex justify-between gap-4">
          <CurrentRecord
            record={optmisticRecords.find((record: Record) => !record.end)}
            now={now}
            setOptimisticRecords={setOptimisticRecords}
          />
          <NewRecord />
        </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between">
            Total
            <Duration records={optmisticRecords} now={now} />
          </CardTitle>
        </CardHeader>
      </Card>
      <div className="space-y-2">
        {Object.entries(groupRecords(optmisticRecords)).map(([day, recordsOfDay]) => (
          <Card
            key={day}
          >
            <CardHeader>
              <CardTitle className="text-base flex justify-between">
                <span>
                  {differenceInCalendarDays(
                    new Date(),
                    new Date(recordsOfDay[0].begin)
                  ) > 1
                    ? capitalize(
                        formatInTimeZone(
                          new Date(recordsOfDay[0].begin),
                          "America/Sao_Paulo",
                          "eeeeee, dd 'de' MMM",
                          { locale: ptbr }
                        )
                      )
                    : `${capitalize(
                        formatRelative(
                          new Date(recordsOfDay[0].begin),
                          new Date(),
                          {
                            locale: ptbr,
                          }
                        ).split(" ")[0]
                      )}, ${formatInTimeZone(
                        new Date(recordsOfDay[0].begin),
                        "America/Sao_Paulo",
                        "dd 'de' MMM",
                        { locale: ptbr }
                      )}`}
                </span>
                <span>
                  <Duration records={recordsOfDay} now={now}/>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pb-4">
              <ul className="space-y-1">
                {recordsOfDay.reverse().map((record) => (
                  <li key={record.id}>
                    <RecordDetails record={record} now={now} setOptimisticRecords={setOptimisticRecords}/>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function groupRecords(records: Record[]): { [key: string]: Record[] } {
  return records.reduce((acc, record) => {
    const day = formatInTimeZone(
      new Date(record.begin),
      "America/Sao_Paulo",
      "yyyy-MM-dd"
    );
    acc[day] = acc[day] ?? [];
    acc[day].push(record);
    return acc;
  }, {});
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

