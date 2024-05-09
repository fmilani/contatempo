"use server"

import { getServerSession } from "next-auth/next"
import { revalidatePath } from "next/cache"
import { authOptions } from "pages/api/auth/[...nextauth]"
import { Tag } from "./lib/api"

export const startStopRecord = async (currentRecord: any, time: Date) => {
  const session = await getServerSession(authOptions)
  if (currentRecord) {
    // TODO: if the user starts and stops too quickly so the POST isnt done on the server
    // the PUT here will have the currentRecord with the optimistic id, resulting
    // in a not found on the server
    // possible solutions:
    // 1. dont let the user stop the record until the start is resolved on the server
    // 2. check here if the id is optimistic and perform a post? nah, it wont work
    // because the start of the record is already being processed by the server, so solution 1 it is?
    await fetch(`${process.env.BACKEND_URL}/records/${currentRecord.id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...currentRecord, end: time.toISOString() }),
    }).then((r) => r.json())
  } else {
    try {
      await fetch(`${process.env.BACKEND_URL}/records`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ begin: time.toISOString() }),
      }).then((r) => r.json())
    } catch (e) {
      // TODO: user feedback
    }
  }
  revalidatePath("/records")
}

export const deleteRecord = async (id: string) => {
  const session = await getServerSession(authOptions)
  await fetch(`${process.env.BACKEND_URL}/records/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      "Content-Type": "application/json",
    },
  })
  revalidatePath("/records")
}

export const addTagToRecord = async (tag: Tag, record: string) => {
  const session = await getServerSession(authOptions)
  await fetch(`${process.env.BACKEND_URL}/records/${record}/tags`, {
    method: "POST",
    body: JSON.stringify({ tag }),
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      "Content-Type": "application/json",
    },
  })
  revalidatePath("/records")
}
export const removeTagFromRecord = async (tag: string, record: string) => {
  const session = await getServerSession(authOptions)
  await fetch(`${process.env.BACKEND_URL}/records/${record}/tags/${tag}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session?.accessToken}`,
      "Content-Type": "application/json",
    },
  })
  revalidatePath("/records")
}
