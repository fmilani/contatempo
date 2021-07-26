import { Suspense } from "react"
import { Head, Link, usePaginatedQuery, useRouter, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
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
            <Link href={Routes.ShowRecordPage({ recordId: record.id })}>
              <a>
                {record.begin.toString()} - {record.end?.toString()}
              </a>
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
    <>
      <Head>
        <title>Records</title>
      </Head>

      <div>
        <p>
          <Link href={Routes.NewRecordPage()}>
            <a>Create Record</a>
          </Link>
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <RecordsList />
        </Suspense>
      </div>
    </>
  )
}

RecordsPage.authenticate = true
RecordsPage.getLayout = (page) => <Layout>{page}</Layout>

export default RecordsPage
