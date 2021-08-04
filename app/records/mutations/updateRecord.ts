import { resolver } from "blitz"
import set from "date-fns/set"
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
    const record = await db.record.update({
      where: { id },
      data: {
        ...data,
        begin: set(data.begin, { seconds: 0, milliseconds: 0 }),
        end: data.end ? set(data.end, { seconds: 0, milliseconds: 0 }) : null,
      },
    })

    return record
  }
)
