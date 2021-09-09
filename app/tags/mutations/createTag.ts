import { resolver } from "blitz"
import db from "db"
import { z } from "zod"

const CreateTag = z.object({
  name: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateTag),
  resolver.authorize(),
  async (input, { session }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const tag = await db.tag.create({
      data: {
        ...input,
        user: { connect: { id: session.userId } },
      },
    })

    return tag
  }
)
