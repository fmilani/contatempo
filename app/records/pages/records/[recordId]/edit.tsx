import { Suspense } from "react"
import Layout from "app/core/layouts/Layout"
import { Link, useRouter, useQuery, useMutation, useParam, BlitzPage } from "blitz"
import getRecord from "app/records/queries/getRecord"
import updateRecord from "app/records/mutations/updateRecord"
import RecordForm, { RecordFormValues } from "app/records/components/RecordForm"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"

export const EditRecordForm = () => {
  const router = useRouter()
  const recordId = useParam("recordId", "number")
  const [record, { setQueryData }] = useQuery(getRecord, { where: { id: recordId } })
  const [updateRecordMutation] = useMutation(updateRecord)

  const user = useCurrentUser()
  return (
    <div>
      <h1>Edit Record {record.id}</h1>
      <pre>{JSON.stringify(record, null, 2)}</pre>
      <RecordForm
        initialValues={record}
        onSubmit={async (values: RecordFormValues) => {
          try {
            const updatedRecord = await updateRecordMutation({
              where: { id: record.id },
              data: {
                start: values.start,
                finish: values.finish,
                user: { connect: { id: user?.id } },
              },
            })
            await setQueryData(updatedRecord)
            router.push(`/records/${updatedRecord.id}`)
          } catch (error) {
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
        <EditRecordForm />
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
