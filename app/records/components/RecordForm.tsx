import { Form, FormProps } from "app/core/components/Form"
import { useField } from "react-final-form"
import { z } from "zod"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { FormControl, FormLabel, Input } from "@chakra-ui/react"

export { FORM_ERROR } from "app/core/components/Form"

export function RecordForm<S extends z.ZodType<any, any>>(
  formProps: FormProps<S> & { endDisabled?: boolean }
) {
  function CustomDatePicker(props: { name: string }) {
    const { input } = useField(props.name)
    const CustomTimeInput = ({ value, onChange }) => (
      <Input type="time" value={value} onChange={(e) => onChange(e.target.value)} />
    )
    return (
      <DatePicker
        dateFormat="dd/MM/yy HH:mm"
        selected={input.value}
        onChange={input.onChange}
        showTimeInput
        customTimeInput={<CustomTimeInput value={input.value} onChange={input.onChange} />}
        customInput={<Input type="datetime" />}
      />
    )
  }
  const { endDisabled, ...actualFormProps } = formProps
  return (
    <Form<S> {...actualFormProps}>
      <FormControl id="begin" isRequired>
        <FormLabel>Begin</FormLabel>
        <CustomDatePicker name="begin" />
      </FormControl>
      {endDisabled ? (
        <p>Record in progress</p>
      ) : (
        <FormControl id="end" isRequired>
          <FormLabel>End</FormLabel>
          <CustomDatePicker name="end" />
        </FormControl>
      )}
    </Form>
  )
}
