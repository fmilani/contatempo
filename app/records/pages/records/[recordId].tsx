import { Suspense } from "react"
import Layout from "app/layouts/Layout"
import { Link, useRouter, useQuery, useParam, BlitzPage, useMutation } from "blitz"
import getRecord from "app/records/queries/getRecord"
import deleteRecord from "app/records/mutations/deleteRecord"

export const Record = () => {
  const router = useRouter()
  const recordId = useParam("recordId", "number")
  const [record] = useQuery(getRecord, { where: { id: recordId } })
  const [deleteRecordMutation] = useMutation(deleteRecord)

  return (
    <div>
      <h1>Record {record.id}</h1>
      <pre>{JSON.stringify(record, null, 2)}</pre>

      <Link href={`/records/${record.id}/edit`}>
        <a>Edit</a>
      </Link>

      <button
        type="button"
        onClick={async () => {
          if (window.confirm("This will be deleted")) {
            await deleteRecordMutation({ where: { id: record.id } })
            router.push("/records")
          }
        }}
      >
        Delete
      </button>
    </div>
  )
}

const ShowRecordPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href="/records">
          <a>Records</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Record />
      </Suspense>
    </div>
  )
}

ShowRecordPage.getLayout = (page) => <Layout title={"Record"}>{page}</Layout>

export default ShowRecordPage
