import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const DeleteRecord = z.object({
  id: z.number(),
})

export default resolver.pipe(resolver.zod(DeleteRecord), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const record = await db.record.deleteMany({ where: { id } })

  return record
})
