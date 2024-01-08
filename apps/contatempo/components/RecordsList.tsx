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

export default function RecordsList({records}) {
  const [now, setNow] = useState<Date>(new Date(new Date().toISOString()));
  useInterval(() => setNow(new Date()), 500);
  const currentRecord = records.find((r) => !r.end);
  const [optmisticRecords, setOptimisticRecords] = useOptimistic(records, (state: any, {action, newRecord}: any) => {
    if (action === 'delete') {
      return state.filter(record => record.id !== newRecord.id);
    } else {
      if (newRecord) {
        return state.map(record => record.id === newRecord.id ? {...record, end: new Date().toISOString()} : record)
        
      } else {
        return [{ id: "optmistic-new-record", begin: new Date().toISOString() }, ...state];
      }

    }
  });
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Registros</h2>
      <form
        action={async () => {
          setOptimisticRecords({action: 'edit', newRecord: currentRecord})
          await startStopRecord(currentRecord);
        }}
      >
      <div className="flex justify-between gap-4">
        <CurrentRecord
          record={optmisticRecords.find(r => !r.end)}
          now={now}
        />
        <NewRecord />
      </div>
      </form>
      <div className="space-y-2">
        {Object.entries(groupRecords(optmisticRecords)).map(([day, recordsOfDay]) => (
          <div
            key={day}
            className="overflow-hidden"
          >
            <div className="flex justify-between font-bold px-4 py-2">
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
            </div>
            <ul className="space-y-1">
              {recordsOfDay.reverse().map((record) => (
                <li key={record.id}>
                  <RecordDetails record={record} now={now} setOptimisticRecords={setOptimisticRecords}/>
                </li>
              ))}
            </ul>
          </div>
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

