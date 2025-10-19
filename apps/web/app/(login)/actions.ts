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
  NewTeamMember,
  NewUser,
  NewTeam,
} from "@/lib/db/schema";
import { redirect } from "next/navigation";
import { comparePasswords, hashPassword, setSession } from "@/lib/auth/session";

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

const signUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { email, password } = data;

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  const passwordHash = await hashPassword(password);

  const newUser: NewUser = {
    email,
    passwordHash,
    role: "owner",
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: "Failed to create user. Please try again.",
      email,
      password,
    };
  }

  let teamId: number;
  let userRole: string;
  let createdTeam: typeof teams.$inferSelect | null = null;
  const newTeam: NewTeam = {
    name: `${email}'s Team`,
  };

  [createdTeam] = await db.insert(teams).values(newTeam).returning();

  if (!createdTeam) {
    return {
      error: "Failed to create team. Please try again.",
      email,
      password,
    };
  }

  teamId = createdTeam.id;
  userRole = "owner";

  await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole,
  };

  await Promise.all([
    db.insert(teamMembers).values(newTeamMember),
    logActivity(teamId, createdUser.id, ActivityType.SIGN_UP),
    setSession(createdUser),
  ]);

  redirect("/now");
});

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
