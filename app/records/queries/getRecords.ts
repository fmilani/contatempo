import { paginate, resolver } from "blitz"
import db, { Prisma } from "db"

interface GetRecordsInput
  extends Pick<Prisma.RecordFindManyArgs, "where" | "orderBy" | "skip" | "take"> {}

export default resolver.pipe(
  resolver.authorize(),
  async ({ where, orderBy, skip = 0, take = 100 }: GetRecordsInput) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const {
      items: records,
      hasMore,
      nextPage,
      count,
    } = await paginate({
      skip,
      take,
      count: () => db.record.count({ where }),
      query: (paginateArgs) => db.record.findMany({ ...paginateArgs, where, orderBy }),
    })

    return {
      records,
      nextPage,
      hasMore,
      count,
    }
  }
)
