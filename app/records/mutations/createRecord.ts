import { resolver } from "blitz"
import set from "date-fns/set"
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
      data: {
        ...input,
        begin: set(input.begin, { seconds: 0, milliseconds: 0 }),
        end: input.end ? set(input.end, { seconds: 0, milliseconds: 0 }) : null,
        user: { connect: { id: session.userId } },
      },
    })

    return record
  }
)
