import { Ctx } from "blitz"
import { set } from "date-fns"
import db, { Prisma } from "db"

type UpdateRecordInput = Pick<Prisma.RecordUpdateArgs, "where" | "data">

export default async function updateRecord({ where, data }: UpdateRecordInput, ctx: Ctx) {
  ctx.session.$authorize()

  let startRounded: Date | undefined
  if (data.start)
    startRounded = set(new Date(data.start.toString()), { seconds: 0, milliseconds: 0 })

  let finishRounded: Date | undefined
  if (data.finish)
    finishRounded = set(new Date(data.finish.toString()), { seconds: 0, milliseconds: 0 })
  const record = await db.record.update({
    where,
    data: {
      ...data,
      start: startRounded,
      finish: finishRounded,
    },
  })

  return record
}
