import Layout from "app/core/layouts/Layout"
import { Link, BlitzPage, useRouter, useMutation } from "blitz"
import RecordForm, { RecordFormValues } from "app/records/components/RecordForm"
import { Suspense } from "react"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import createRecord from "app/records/mutations/createRecord"

const CreateRecordForm = () => {
  const router = useRouter()
  const user = useCurrentUser()
  const [createRecordMutation] = useMutation(createRecord)

  return (
    <RecordForm
      initialValues={{ start: new Date(), finish: null }}
      onSubmit={async (values: RecordFormValues) => {
        try {
          const record = await createRecordMutation({
            data: {
              start: values.start,
              finish: values.finish,
              user: { connect: { id: user?.id } },
            },
          })
          router.push(`/records/${record.id}`)
        } catch (error) {
          alert("Error creating record " + JSON.stringify(error, null, 2))
        }
      }}
    />
  )
}

const NewRecordPage: BlitzPage = () => {
  return (
    <div>
      <h1>Create New Record</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <CreateRecordForm />
      </Suspense>
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
