import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useParam, BlitzPage, useMutation, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getRecord from "app/records/queries/getRecord"
import deleteRecord from "app/records/mutations/deleteRecord"

export const Record = () => {
  const router = useRouter()
  const recordId = useParam("recordId", "number")
  const [deleteRecordMutation] = useMutation(deleteRecord)
  const [record] = useQuery(getRecord, { id: recordId })

  return (
    <>
      <Head>
        <title>Record {record.id}</title>
      </Head>

      <div>
        <h1>Record {record.id}</h1>
        <pre>{JSON.stringify(record, null, 2)}</pre>

        <Link href={Routes.EditRecordPage({ recordId: record.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteRecordMutation({ id: record.id })
              router.push(Routes.RecordsPage())
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  )
}

const ShowRecordPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.RecordsPage()}>
          <a>Records</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Record />
      </Suspense>
    </div>
  )
}

ShowRecordPage.authenticate = true
ShowRecordPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowRecordPage
