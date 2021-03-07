import Form from "app/components/Form"
import { Input, Text, Wrap, WrapItem } from "@chakra-ui/react"
import { ErrorMessage, useField, useFormikContext } from "formik"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const CustomTimeInput = ({ value, onChange }) => (
  <Input
    type="time"
    style={{ width: "100%" }}
    value={value}
    onChange={(e) => {
      console.log(e.target.value)
      onChange(e.target.value)
    }}
  />
)
const CustomDatePicker = (props) => {
  const { setFieldValue } = useFormikContext()
  const [field] = useField(props)

  return (
    <DatePicker
      customInput={<Input placeholder="Choose a date and time" />}
      showTimeInput
      customTimeInput={<CustomTimeInput value={props.value} onChange={props.onChange} />}
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

export type RecordFormValues = {
  start: Date
  finish: Date | null
}

const RecordForm = ({ initialValues, onSubmit }) => {
  return (
    <>
      <Form initialValues={initialValues} submitText="Submit" onSubmit={onSubmit}>
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
      </Form>
    </>
  )
}

export default RecordForm
