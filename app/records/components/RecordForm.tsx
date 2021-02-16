import { Input } from "@chakra-ui/react"
import { ErrorMessage, Field, Form, Formik } from "formik"
import React from "react"

type RecordFormProps = {
  initialValues: any
  onSubmit: React.FormEventHandler<HTMLFormElement>
}

const RecordForm = ({ initialValues, onSubmit }: RecordFormProps) => {
  return (
    <Formik initialValues={{}} onSubmit={(values) => alert(JSON.stringify(values))}>
      {() => (
        <Form>
          <Field type="date" name="start" as={Input} />
          <ErrorMessage name="start" component="div" />
          <Field type="date" name="finish" />
          <ErrorMessage name="finish" component="div" />
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  )
}

export default RecordForm
