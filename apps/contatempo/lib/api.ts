import { getSession } from "./session"

export type Record = {
  id: string
  begin: string
  end?: string
  tags: { id: string; value: string }[]
}

interface GetRecordsRequest {
  from: Date
  to: Date
}

export async function getRecords({ from, to }: GetRecordsRequest) {
  const session = await getSession()
  const records: Record[] = await fetch(
    `${
      process.env.BACKEND_URL
    }/records?from=${from.toISOString()}&to=${to.toISOString()}`,
    {
      headers: { Authorization: `Bearer ${session?.accessToken}` },
    },
  ).then((r) => r.json())
  return records
}

export async function getSummary({ from, to }: GetRecordsRequest) {
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
