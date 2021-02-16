import { Suspense } from "react"
import Layout from "app/layouts/Layout"
import { Link, useRouter, useQuery, useMutation, useParam, BlitzPage } from "blitz"
import getRecord from "app/records/queries/getRecord"
import updateRecord from "app/records/mutations/updateRecord"
import RecordForm from "app/records/components/RecordForm"

export const EditRecord = () => {
  const router = useRouter()
  const recordId = useParam("recordId", "number")
  const [record, { setQueryData }] = useQuery(getRecord, { where: { id: recordId } })
  const [updateRecordMutation] = useMutation(updateRecord)

  return (
    <div>
      <h1>Edit Record {record.id}</h1>
      <pre>{JSON.stringify(record)}</pre>

      <RecordForm
        initialValues={record}
        onSubmit={async () => {
          try {
            const updated = await updateRecordMutation({
              where: { id: record.id },
              data: { name: "MyNewName" },
            })
            await setQueryData(updated)
            alert("Success!" + JSON.stringify(updated))
            router.push(`/records/${updated.id}`)
          } catch (error) {
            console.log(error)
            alert("Error editing record " + JSON.stringify(error, null, 2))
          }
        }}
      />
    </div>
  )
}

const EditRecordPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditRecord />
      </Suspense>

      <p>
        <Link href="/records">
          <a>Records</a>
        </Link>
      </p>
    </div>
  )
}

EditRecordPage.getLayout = (page) => <Layout title={"Edit Record"}>{page}</Layout>

export default EditRecordPage
