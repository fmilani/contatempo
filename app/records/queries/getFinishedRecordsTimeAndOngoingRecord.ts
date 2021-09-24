import { resolver } from "blitz"
import db from "db"

export default resolver.pipe(resolver.authorize(), async ({ where }, { session }) => {
  // TODO: in multi-tenant app, you must add validation to ensure correct tenant
  console.log(where)
  let totalTimeQueryResult
  if (where.begin.lte) {
    totalTimeQueryResult = await db.$queryRaw(
      'select sum(extract(epoch from "end") - extract(epoch from "begin")) as finishedrecordstime from "Record" where "begin" between $1 and $2 and "end" is not null and "userId" = $3',
      where.begin.gte,
      where.begin.lte,
      session.userId
    )
  } else {
    totalTimeQueryResult = await db.$queryRaw(
      'select sum(extract(epoch from "end") - extract(epoch from "begin")) as finishedrecordstime from "Record" where "end" is not null and "userId" = $1',
      session.userId
    )
  }
  const ongoingRecord = await db.record.findFirst({ where: { ...where, end: null } })
  return { finishedRecordsTime: totalTimeQueryResult[0].finishedrecordstime, ongoingRecord }
})
