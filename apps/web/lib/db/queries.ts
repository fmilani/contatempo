import { and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import { teamMembers, users } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { N_RECENT_RECORDS } from "../constants";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "number"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getRecentRecords() {
  const user = await getUser();
  if (!user) {
    return [];
  }
  const recordsResult = await db.query.records.findMany({
    orderBy: (records, { desc }) => [desc(records.start)],
    limit: N_RECENT_RECORDS + 1,
    with: {
      tagsToRecords: {
        with: {
          tag: true,
        },
      },
    },
  });
  return recordsResult.map(({ tagsToRecords, ...rest }) => ({
    ...rest,
    tags: tagsToRecords.map(({ tag }) => tag),
  }));
}

export async function getUserTags() {
  const user = await getUser();
  if (!user) {
    return [];
  }
  const tagsResult = await db.query.tags.findMany({
    where: (tags, { eq }) => eq(tags.userId, user.id),
  });
  return tagsResult;
}
