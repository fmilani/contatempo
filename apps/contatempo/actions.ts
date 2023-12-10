"use server";

import { getServerSession } from "next-auth/next";
import { revalidatePath } from "next/cache";
import { authOptions } from "pages/api/auth/[...nextauth]";

export const startStopRecord = async (currentRecord: any) => {
  const session = await getServerSession(authOptions);
          if (currentRecord) {
    await fetch(
      `${process.env.BACKEND_URL}/records/${currentRecord.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({...currentRecord, end: new Date().toISOString()}),
      }
    ).then((r) => r.json());
          } else {
            try {
      await fetch(`${process.env.BACKEND_URL}/records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({begin: new Date().toISOString()}),
    }).then((r) => r.json());
            } catch (e) {
              // TODO: user feedback
            }
          }
          revalidatePath("/records");
}
