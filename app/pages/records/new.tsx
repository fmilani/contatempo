import { useRouter, useMutation, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import createRecord from "app/records/mutations/createRecord"
import { RecordForm, FORM_ERROR } from "app/records/components/RecordForm"
import React from "react"
import { Box, Heading } from "@chakra-ui/react"

const NewRecordPage: BlitzPage = () => {
  const router = useRouter()
  const [createRecordMutation] = useMutation(createRecord)

  return (
    <Box p={4} borderWidth="1px" bg="white" shadow="sm" w="full">
      <Heading size="sm" mb={4}>
        Create New Record
      </Heading>

      <RecordForm
        submitText="Create Record"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateRecord}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            await createRecordMutation(values)
            router.push(Routes.RecordsPage())
          } catch (error) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />
    </Box>
  )
}

NewRecordPage.authenticate = true
NewRecordPage.getLayout = (page) => <Layout title={"Create New Record"}>{page}</Layout>

export default NewRecordPage
