import { Suspense } from "react"
import Layout from "app/core/layouts/Layout"
import { Link, usePaginatedQuery, useRouter, BlitzPage } from "blitz"
import getRecords from "app/records/queries/getRecords"
import { useCurrentUser } from "app/hooks/useCurrentUser"

const ITEMS_PER_PAGE = 100

export const RecordsList = () => {
  const router = useRouter()
  const user = useCurrentUser()
  const page = Number(router.query.page) || 0
  const [{ records, hasMore }] = usePaginatedQuery(getRecords, {
    where: { userId: user?.id },
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  function groupBy(propertyExtractor) {
    return function group(array) {
      return array.reduce((acc, obj) => {
        const property = propertyExtractor(obj)
        acc[property] = acc[property] || []
        acc[property].push(obj)
        return acc
      }, {})
    }
  }

  const groupByDay = groupBy((record) => `${record.start.getMonth()}-${record.start.getDate()}`)
  const groupedRecords = groupByDay(records)

  return (
    <div>
      {Object.entries(groupedRecords).map(([day, records]) => {
        return (
          <div key={day}>
            <h3>Day: {day}</h3>
            <ul>
              {records.map((record) => (
                <li key={record.id}>
                  <Link href={`/records/${record.id}`}>
                    <a>
                      {record.start.toString()} - {record.finish?.toString()}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const RecordsPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href="/records/new">
          <a>Create Record</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <RecordsList />
      </Suspense>
    </div>
  )
}

RecordsPage.getLayout = (page) => <Layout title={"Records"}>{page}</Layout>

export default RecordsPage
