import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetRecordsInput
  extends Pick<Prisma.RecordFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetRecordsInput, { session }) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const whereWithUser = { ...where, userId: session.userId }
    const {
      items: records,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.record.count({ where: whereWithUser }),
      query: (paginateArgs) =>
        db.record.findMany({ ...paginateArgs, where: whereWithUser, orderBy }),
    })

    return {
      records,
      nextPage,
      hasMore,
      count,
    }
  }
)
