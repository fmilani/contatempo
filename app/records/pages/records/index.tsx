import { Suspense } from "react"
import Layout from "app/layouts/Layout"
import { Link, usePaginatedQuery, useRouter, BlitzPage } from "blitz"
import getRecords from "app/records/queries/getRecords"

const ITEMS_PER_PAGE = 100

export const RecordsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ records, hasMore }] = usePaginatedQuery(getRecords, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  return (
    <div>
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            <Link href={`/records/${record.id}`}>
              <a>{record.name}</a>
            </Link>
          </li>
        ))}
      </ul>

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
