import Layout from "app/layouts/Layout"
import { Link, useRouter, useMutation, BlitzPage } from "blitz"
import createRecord from "app/records/mutations/createRecord"
import RecordForm from "app/records/components/RecordForm"

const NewRecordPage: BlitzPage = () => {
  const router = useRouter()
  const [createRecordMutation] = useMutation(createRecord)

  return (
    <div>
      <h1>Create New Record</h1>

      <RecordForm
        initialValues={{}}
        onSubmit={async () => {
          try {
            const record = await createRecordMutation({ data: { name: "MyName" } })
            alert("Success!" + JSON.stringify(record))
            router.push(`/records/${record.id}`)
          } catch (error) {
            alert("Error creating record " + JSON.stringify(error, null, 2))
          }
        }}
      />

      <p>
        <Link href="/records">
          <a>Records</a>
        </Link>
      </p>
    </div>
  )
}

NewRecordPage.getLayout = (page) => <Layout title={"Create New Record"}>{page}</Layout>

export default NewRecordPage
