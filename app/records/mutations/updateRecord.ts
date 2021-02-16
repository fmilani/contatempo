import { Ctx } from "blitz"
import db, { Prisma } from "db"

type UpdateRecordInput = Pick<Prisma.RecordUpdateArgs, "where" | "data">

export default async function updateRecord({ where, data }: UpdateRecordInput, ctx: Ctx) {
  ctx.session.authorize()

  const record = await db.record.update({ where, data })

  return record
}
