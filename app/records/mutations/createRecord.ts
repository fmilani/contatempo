import { Ctx } from "blitz"
import db, { Prisma } from "db"

type CreateRecordInput = Pick<Prisma.RecordCreateArgs, "data">
export default async function createRecord({ data }: CreateRecordInput, ctx: Ctx) {
  ctx.session.$authorize()

  const record = await db.record.create({ data })

  return record
}
