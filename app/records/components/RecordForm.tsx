import React from "react"
import { useRouter, useMutation } from "blitz"
import { Input, Text, Wrap, WrapItem } from "@chakra-ui/react"
import createRecord from "app/records/mutations/createRecord"
import { useCurrentUser } from "app/hooks/useCurrentUser"
import { ErrorMessage, Form, Formik, useField, useFormikContext } from "formik"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const CustomDatePicker = (props) => {
  const { setFieldValue } = useFormikContext()
  const [field] = useField(props)
  const CustomTimeInput = ({ value, onChange }) => (
    <Input
      type="time"
      style={{ width: "100%" }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )

  return (
    <DatePicker
      customInput={<Input placeholder="Choose a date and time" />}
      showTimeInput
      customTimeInput={<CustomTimeInput />}
      dateFormat="MM/dd/yyyy HH:mm"
      {...field}
      {...props}
      selected={(field.value && new Date(field.value)) || null}
      onChange={(val: Date) => {
        setFieldValue(field.name, val)
      }}
    />
  )
}

const RecordForm = () => {
  const router = useRouter()
  const user = useCurrentUser()
  const [createRecordMutation] = useMutation(createRecord)
  return (
    <Formik
      initialValues={{ start: "", finish: "" }}
      onSubmit={async (values) => {
        try {
          const record = await createRecordMutation({
            data: {
              start: values.start,
              finish: values.finish,
              user: { connect: { id: user?.id } },
            },
          })
          alert("Success!" + JSON.stringify(record))
          router.push(`/records/${record.id}`)
        } catch (error) {
          alert("Error creating record " + JSON.stringify(error, null, 2))
        }
      }}
    >
      {() => (
        <Form>
          <Wrap spacing="1rem">
            <WrapItem alignItems="center">
              <label htmlFor="start">
                <Text>Start:</Text>
              </label>
              <CustomDatePicker name="start" />
              <ErrorMessage name="start" component="div" />
            </WrapItem>
            <WrapItem alignItems="center" spacing="20px">
              <label htmlFor="finish">
                <Text>Finish:</Text>
              </label>
              <CustomDatePicker name="finish" isClearable />
              <ErrorMessage name="finish" component="div" />
            </WrapItem>
          </Wrap>
          <button type="submit">Submit</button>
        </Form>
      )}
    </Formik>
  )
}

export default RecordForm
