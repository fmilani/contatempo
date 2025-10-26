"use server";

import { actionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { Record, NewRecord, records } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const startRecording = actionWithUser<
  { start: Date },
  { record: Record }
>(async (data, user) => {
  const newRecord: NewRecord = {
    userId: user.id,
    start: data.start,
  };
  const newRecordSaved = await db.insert(records).values(newRecord).returning();
  // revalidatePath("/now");
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

  const newRecordSaved = await db
    .update(records)
    .set({ end: data.end })
    .where(eq(records.id, userRecord.id))
    .returning();
  // revalidatePath("/now");
  return { record: newRecordSaved[0] };
});
