import React, { Suspense } from "react"
import {
  Head,
  useRouter,
  useQuery,
  useParam,
  BlitzPage,
  useMutation,
  Routes,
  invalidateQuery,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getRecord from "app/records/queries/getRecord"
import deleteRecord from "app/records/mutations/deleteRecord"
import { FORM_ERROR, RecordForm } from "app/records/components/RecordForm"
import updateRecord from "app/records/mutations/updateRecord"
import { Box, Button, Center, Heading } from "@chakra-ui/react"
import { format } from "date-fns"
import getRecords from "app/records/queries/getRecords"

export const Record = () => {
  const router = useRouter()
  const recordId = useParam("recordId", "number")
  const [deleteRecordMutation] = useMutation(deleteRecord)
  const [updateRecordMutation] = useMutation(updateRecord)
  const [record, { setQueryData }] = useQuery(
    getRecord,
    { id: recordId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )

  return (
    <>
      <Head>
        <title>Record details</title>
      </Head>

      <Box p={4} borderWidth="1px" bg="white" shadow="sm" w="full">
        <Heading size="sm" mb={4}>
          On {format(record.begin, "EEEE, MMMM dd")}
        </Heading>
        <RecordForm
          submitText="Save"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateRecord}
          initialValues={record}
          endDisabled={record.begin && record.end === null}
          onSubmit={async (values) => {
            try {
              const updated = await updateRecordMutation({
                id: record.id,
                ...values,
              })
              if (record.begin && !record.end) invalidateQuery(getRecords)
              await setQueryData(updated)
              router.back()
            } catch (error) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />
      </Box>
      <Center m={4}>
        <Button
          variant="solid"
          colorScheme="red"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteRecordMutation({ id: record.id })
              router.back()
            }
          }}
        >
          Delete Record
        </Button>
      </Center>
    </>
  )
}

const ShowRecordPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Record />
      </Suspense>
    </div>
  )
}

ShowRecordPage.authenticate = true
ShowRecordPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowRecordPage
