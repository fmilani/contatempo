"use server";

import { validatedActionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { NewRecord, records } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as z from "zod";

const startRecordingSchema = z.object({
  start: z.coerce.date(),
});
export const startRecording = validatedActionWithUser(
  startRecordingSchema,
  async (data, _, user) => {
    const newRecord: NewRecord = {
      userId: user.id,
      start: data.start,
    };
    const newRecordSaved = await db
      .insert(records)
      .values(newRecord)
      .returning();
    revalidatePath("/now");
    return { record: newRecordSaved[0] };
  },
);

const stopRecordingSchema = z.object({
  recordId: z.coerce.number(),
  end: z.coerce.date(),
});
export const stopRecording = validatedActionWithUser(
  stopRecordingSchema,
  async (data, _, user) => {
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
    revalidatePath("/now");
    return { record: newRecordSaved[0] };
  },
);
