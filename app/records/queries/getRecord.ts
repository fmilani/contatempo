import { Ctx, NotFoundError } from "blitz"
import db, { Prisma } from "db"

type GetRecordInput = Pick<Prisma.FindFirstRecordArgs, "where">

export default async function getRecord({ where }: GetRecordInput, ctx: Ctx) {
  ctx.session.authorize()

  const record = await db.record.findFirst({ where })

  if (!record) throw new NotFoundError()

  return record
}
