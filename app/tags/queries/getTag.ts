import { resolver, NotFoundError } from "blitz"
import db from "db"
import { z } from "zod"

const GetTag = z.object({
  // This accepts type of undefined, but is required at runtime
  id: z.number().optional().refine(Boolean, "Required"),
})

export default resolver.pipe(resolver.zod(GetTag), resolver.authorize(), async ({ id }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const tag = await db.tag.findFirst({ where: { id } })

  if (!tag) throw new NotFoundError()

  return tag
})
