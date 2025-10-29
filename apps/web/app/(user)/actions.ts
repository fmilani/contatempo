"use server";

import { actionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { Record, NewRecord, records } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const startRecording = actionWithUser<
  { start: Date },
  { record: Record }
>(async (data, user) => {
  const startWithNoMillis = new Date(data.start);
  startWithNoMillis.setMilliseconds(0);
  const newRecord: NewRecord = {
    userId: user.id,
    start: startWithNoMillis,
  };
  const newRecordSaved = await db
    .insert(records)
    .values(newRecord)
    .onConflictDoNothing()
    .returning();
  return { record: newRecordSaved[0] };
});

export const stopRecording = actionWithUser<
  { end: Date; recordId: number },
  { record: Record }
>(async (data, user) => {
  const userRecord = await db.query.records.findFirst({
    where: (records, { eq }) => eq(records.id, data.recordId),
  });
  if (!userRecord || userRecord.userId !== user.id) {
    throw new Error("Record not found");
  }

  const endWithNoMillis = new Date(data.end);
  endWithNoMillis.setMilliseconds(0);
  const newRecordSaved = await db
    .update(records)
    .set({ end: endWithNoMillis })
    .where(eq(records.id, userRecord.id))
    .returning();
  return { record: newRecordSaved[0] };
});
