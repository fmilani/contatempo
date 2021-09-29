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
    return (
      <DatePicker
        dateFormat="dd/MM/yy HH:mm"
        selected={input.value}
        onChange={input.onChange}
        showTimeInput
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
      <style global jsx>{`
        .react-datepicker-time__input input {
          border: 2px solid rgb(53, 68, 151);
        }
      `}</style>
    </Form>
  )
}
