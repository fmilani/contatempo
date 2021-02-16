import { Ctx } from "blitz"
import db, { Prisma } from "db"

type DeleteRecordInput = Pick<Prisma.RecordDeleteArgs, "where">

export default async function deleteRecord({ where }: DeleteRecordInput, ctx: Ctx) {
  ctx.session.authorize()

  const record = await db.record.delete({ where })

  return record
}
