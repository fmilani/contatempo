"use server";

import { db } from "@/lib/db/drizzle";
import { validatedAction } from "@/lib/auth/middleware";
import * as z from "zod";
import { eq } from "drizzle-orm";
import {
  users,
  teams,
  teamMembers,
  ActivityType,
  activityLogs,
  NewActivityLog,
} from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { comparePasswords, setSession } from "@/lib/auth/session";

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string,
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || "",
  };
  await db.insert(activityLogs).values(newActivity);
}

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { email, password } = data;

  const userWithTeam = await db
    .select({
      user: users,
      team: teams,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash,
  );

  if (!isPasswordValid) {
    return {
      error: "Invalid email or password. Please try again.",
      email,
      password,
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
  ]);

  redirect("/now");
});
