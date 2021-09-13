import { resolver } from "blitz"
import { endOfDay } from "date-fns"
import db from "db"
import { recordsMailer } from "mailers/recordsMailer"

export default resolver.pipe(resolver.authorize(), async ({ startDate, endDate }, { session }) => {
  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (!user) throw new Error("You need to be authenticated!")

  const records = await db.record.findMany({
    where: {
      userId: session.userId,
      begin: {
        gte: startDate || undefined,
        lte: endDate ? endOfDay(endDate) : undefined,
      },
    },
  })

  await recordsMailer({ to: user.email, startDate, endDate, records }).send()

  return
})
