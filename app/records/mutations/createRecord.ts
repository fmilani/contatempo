import { Ctx } from "blitz"
import { set } from "date-fns"
import db, { Prisma } from "db"

type CreateRecordInput = Pick<Prisma.RecordCreateArgs, "data">
export default async function createRecord({ data }: CreateRecordInput, ctx: Ctx) {
  ctx.session.$authorize()

  const startRounded = set(new Date(data.start), { seconds: 0, milliseconds: 0 })

  let finishRounded: Date | null = null
  if (data.finish) finishRounded = set(new Date(data.finish), { seconds: 0, milliseconds: 0 })

  const record = await db.record.create({
    data: {
      ...data,
      start: startRounded,
      finish: finishRounded,
    },
  })

  return record
}
