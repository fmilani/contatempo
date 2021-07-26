import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateRecord = z.object({
  begin: z.date(),
  end: z.date().optional().nullable(),
})

export default resolver.pipe(
  resolver.zod(CreateRecord),
  resolver.authorize(),
  async (input, { session }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const record = await db.record.create({
      data: { ...input, user: { connect: { id: session.userId } } },
    })

    return record
  }
)
