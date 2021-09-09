import { resolver } from "blitz"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, { session }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  const totalTimeQueryResult = await db.$queryRaw(
    'select sum(extract(epoch from "end") - extract(epoch from "begin")) as totalTime from "Record" where "end" is not null and "userId" = $1',
    session.userId
  )
  const ongoingRecord = await db.record.findFirst({ where: { end: null } })
  return { totalTime: totalTimeQueryResult[0].totaltime, ongoingRecord }
})
