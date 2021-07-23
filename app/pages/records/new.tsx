import { Link, useRouter, useMutation, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import createRecord from "app/records/mutations/createRecord"
import { RecordForm, FORM_ERROR } from "app/records/components/RecordForm"

const NewRecordPage: BlitzPage = () => {
  const router = useRouter()
  const [createRecordMutation] = useMutation(createRecord)

  return (
    <div>
      <h1>Create New Record</h1>

      <RecordForm
        submitText="Create Record"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateRecord}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const record = await createRecordMutation(values)
            router.push(Routes.ShowRecordPage({ recordId: record.id }))
          } catch (error) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />

      <p>
        <Link href={Routes.RecordsPage()}>
          <a>Records</a>
        </Link>
      </p>
    </div>
  )
}

NewRecordPage.authenticate = true
NewRecordPage.getLayout = (page) => <Layout title={"Create New Record"}>{page}</Layout>

export default NewRecordPage
