import Layout from "app/layouts/Layout"
import { Link, BlitzPage } from "blitz"
import RecordForm from "app/records/components/RecordForm"
import { Suspense } from "react"

const NewRecordPage: BlitzPage = () => {
  return (
    <div>
      <h1>Create New Record</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <RecordForm />
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
