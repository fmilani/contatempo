import { Suspense } from "react"
import { Head, Link, useRouter, useQuery, useMutation, useParam, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import getRecord from "app/records/queries/getRecord"
import updateRecord from "app/records/mutations/updateRecord"
import { RecordForm, FORM_ERROR } from "app/records/components/RecordForm"

export const EditRecord = () => {
  const router = useRouter()
  const recordId = useParam("recordId", "number")
  const [record, { setQueryData }] = useQuery(
    getRecord,
    { id: recordId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateRecordMutation] = useMutation(updateRecord)

  return (
    <>
      <Head>
        <title>Edit Record {record.id}</title>
      </Head>

      <div>
        <h1>Edit Record {record.id}</h1>
        <pre>{JSON.stringify(record)}</pre>

        <RecordForm
          submitText="Update Record"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateRecord}
          initialValues={record}
          onSubmit={async (values) => {
            try {
              const updated = await updateRecordMutation({
                id: record.id,
                ...values,
              })
              await setQueryData(updated)
              router.push(Routes.ShowRecordPage({ recordId: updated.id }))
            } catch (error) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </div>
    </>
  )
}

const EditRecordPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditRecord />
      </Suspense>

      <p>
        <Link href={Routes.RecordsPage()}>
          <a>Records</a>
        </Link>
      </p>
    </div>
  )
}

EditRecordPage.authenticate = true
EditRecordPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditRecordPage
