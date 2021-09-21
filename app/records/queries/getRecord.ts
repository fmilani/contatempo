import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetRecord = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(
  resolver.zod(GetRecord),
  resolver.authorize(),
  async ({ id }, { session }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const record = await db.record.findFirst({ where: { id } })

    if (!record || record.userId !== session.userId) throw new NotFoundError()

    return record
  }
)
