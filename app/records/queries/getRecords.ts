import { Ctx } from "blitz"
import db, { Prisma } from "db"

type GetRecordsInput = Pick<Prisma.RecordFindManyArgs, "where" | "orderBy" | "skip" | "take">

export default async function getRecords(
  { where, orderBy, skip = 0, take }: GetRecordsInput,
  ctx: Ctx
) {
  ctx.session.$authorize()

  const records = await db.record.findMany({
    where,
    orderBy,
    take,
    skip,
  })

  const count = await db.record.count()
  const hasMore = typeof take === "number" ? skip + take < count : false
  const nextPage = hasMore ? { take, skip: skip + take! } : null

  return {
    records,
    nextPage,
    hasMore,
    count,
  }
}
