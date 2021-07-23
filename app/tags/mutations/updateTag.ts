import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const UpdateTag = z.object({
  id: z.number(),
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateTag),
  resolver.authorize(),
  async ({ id, ...data }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const tag = await db.tag.update({ where: { id }, data })

    return tag
  }
)
