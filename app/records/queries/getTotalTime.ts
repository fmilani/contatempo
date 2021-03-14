import { Ctx } from "blitz"
import db, { Prisma } from "db"

type GetTotalTimeInput = Pick<Prisma.FindManyRecordArgs, "where">

export default async function getTotalTime({ where }: GetTotalTimeInput, ctx: Ctx) {
  ctx.session.$authorize()

  return await db.$queryRaw(
    'select sum(extract(epoch from finish) - extract(epoch from start)) as totalTime from "Record" where finish is not null and "userId" = 1'
  )
}
