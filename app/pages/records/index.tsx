import { Suspense } from "react"
import {
  Head,
  Link,
  useMutation,
  useQuery,
  usePaginatedQuery,
  useRouter,
  invalidateQuery,
  BlitzPage,
  Routes,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import createRecord from "app/records/mutations/createRecord"
import updateRecord from "app/records/mutations/updateRecord"
import getRecords from "app/records/queries/getRecords"
import { Record } from "db"

const ITEMS_PER_PAGE = 100

export const RecordsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ records, hasMore }] = usePaginatedQuery(getRecords, {
    orderBy: { begin: "desc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  function groupBy(propertyExtractor: (r: Record) => string) {
    return function group(array: Record[]) {
      return array.reduce((acc, obj) => {
        const property = propertyExtractor(obj)
        acc[property] = acc[property] || []
        acc[property].push(obj)
        return acc
      }, {})
    }
  }

  const groupByDay = groupBy(
    (record) =>
      `${record.begin.getFullYear()}-${record.begin.getMonth() + 1}-${record.begin.getDate()}`
  )

  return (
    <div>
      {Object.entries(groupByDay(records)).map(([day, records]) => (
        <ul key={day}>
          <div>{day}</div>
          {(records as Record[]).reverse().map((record: Record) => (
            <li key={record.id}>
              <Link href={Routes.ShowRecordPage({ recordId: record.id })}>
                <a>
                  {record.begin.toString()} - {record.end?.toString()}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      ))}
      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const StartStop = () => {
  const [{ records: recordsInProgress }] = useQuery(getRecords, {
    where: { end: null },
    orderBy: { begin: "asc" },
    skip: 0,
    take: 1,
  })
  const [createRecordMutation] = useMutation(createRecord)
  const [updateRecordMutation] = useMutation(updateRecord)

  const saveOrUpdateRecord = async () => {
    if (recordsInProgress.length == 0) {
      try {
        await createRecordMutation({
          begin: new Date(),
        })
        invalidateQuery(getRecords)
      } catch (error) {
        alert("Error creating record " + JSON.stringify(error, null, 2))
      }
    } else {
      try {
        const recordInProgress = recordsInProgress[0]!!
        await updateRecordMutation({
          id: recordInProgress.id,
          begin: recordInProgress.begin,
          end: new Date(),
        })
        invalidateQuery(getRecords)
      } catch (error) {
        alert("Error editing record " + JSON.stringify(error, null, 2))
      }
    }
  }

  return (
    <button onClick={() => saveOrUpdateRecord()}>
      {recordsInProgress.length > 0 ? "Stop" : "Start"}
    </button>
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
          <StartStop />
          <RecordsList />
        </Suspense>
      </div>
    </>
  )
}

RecordsPage.authenticate = true
RecordsPage.getLayout = (page) => <Layout>{page}</Layout>

export default RecordsPage
