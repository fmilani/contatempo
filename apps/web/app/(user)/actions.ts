"use server";

import { actionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import {
  Record,
  NewRecord,
  records,
  RecordWithTags,
  tagsToRecords,
} from "@/lib/db/schema";
import { and, eq, inArray } from "drizzle-orm";

export const startRecording = actionWithUser<
  { start: Date },
  { record: RecordWithTags }
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
  return { record: { ...newRecordSaved[0], tags: [] } };
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
export const updateRecordDescription = actionWithUser<
  { description: string; recordId: number },
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
    .set({ description: data.description })
    .where(eq(records.id, userRecord.id))
    .returning();
  return { record: newRecordSaved[0] };
});
export const updateRecordTags = actionWithUser<
  { tags: number[]; recordId: number },
  void
>(async (data, user) => {
  const userRecord = await db.query.records.findFirst({
    where: (records, { eq }) => eq(records.id, data.recordId),
  });
  if (!userRecord || userRecord.userId !== user.id) {
    throw new Error("Record not found");
  }

  await db.transaction(async (tx) => {
    const existingTags = await tx
      .select({ tagId: tagsToRecords.tagId })
      .from(tagsToRecords)
      .where(eq(tagsToRecords.recordId, data.recordId));
    const existingTagIds = existingTags.map((r) => r.tagId);

    const tagsToDelete = existingTagIds.filter(
      (tagId) => !data.tags.includes(tagId),
    );

    const tagsToInsert = data.tags.filter(
      (tagId) => !existingTagIds.includes(tagId),
    );

    if (tagsToDelete.length > 0) {
      await tx
        .delete(tagsToRecords)
        .where(
          and(
            eq(tagsToRecords.recordId, data.recordId),
            inArray(tagsToRecords.tagId, tagsToDelete),
          ),
        );
    }

    if (tagsToInsert.length > 0) {
      await tx.insert(tagsToRecords).values(
        tagsToInsert.map((tagId) => ({
          recordId: data.recordId,
          tagId,
        })),
      );
    }
  });
});
