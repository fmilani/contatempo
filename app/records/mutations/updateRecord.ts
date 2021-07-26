import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateRecord = z.object({
  id: z.number(),
  begin: z.date(),
  end: z.date().optional().nullable(),
})

export default resolver.pipe(
  resolver.zod(UpdateRecord),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const record = await db.record.update({ where: { id }, data })

    return record
  }
)
