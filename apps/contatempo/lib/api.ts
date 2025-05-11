import { getSession } from "./session"

export type Record = {
  id: string
  begin: string
  end?: string
  tags: Tag[]
}
export type Tag = { id: string; value: string; color: string }

interface GetRecordsRequest {
  from: Date
  to: Date
  tags: string[]
}

interface DashboardRequest {
  from: Date
  to: Date
}

export async function getRecords({ from, to, tags }: GetRecordsRequest) {
  const session = await getSession()
  const records: Record[] = await fetch(
    `${process.env.BACKEND_URL}/records?${new URLSearchParams({
      from: from.toISOString(),
      to: to.toISOString(),
      tags: JSON.stringify(tags),
    })}`,
    {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    },
  ).then((r) => r.json())
  return records
}

export async function getSummary({ from, to }: DashboardRequest) {
  const session = await getSession()
  const summary = await fetch(
    `${
      process.env.BACKEND_URL
    }/records/summary?from=${from.toISOString()}&to=${to.toISOString()}`,
    {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    },
  ).then((r) => r.json())

  return summary.value
}

export async function getTags() {
  const session = await getSession()
  const tags: Tag[] = await fetch(`${process.env.BACKEND_URL}/tags`, {
    headers: { Authorization: `Bearer ${session?.accessToken}` },
  }).then((r) => r.json())
  return tags
}
