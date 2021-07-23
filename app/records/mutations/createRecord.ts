import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateRecord = z.object({
  name: z.string(),
})

export default resolver.pipe(resolver.zod(CreateRecord), resolver.authorize(), async (input) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const record = await db.record.create({ data: input })

  return record
})
