import { setHours, startOfToday, subDays } from "date-fns"
import db from "./index"

const seed = async () => {
  await db.record.deleteMany({})
  for (let j = 0; j < 6; j++) {
    for (let i = 0; i < 4; i++) {
      await db.record.create({
        data: {
          begin: subDays(setHours(startOfToday(), 2 * i + 5), 7 * j),
          end: subDays(setHours(startOfToday(), 2 * i + 6), 7 * j),
          user: { connect: { id: 1 } },
        },
      })
      await db.record.create({
        data: {
          begin: subDays(setHours(startOfToday(), 2 * i + 5), 7 * j + 1),
          end: subDays(setHours(startOfToday(), 2 * i + 6), 7 * j + 1),
          user: { connect: { id: 1 } },
        },
      })
    }
  }
}

export default seed
