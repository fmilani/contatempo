import { Form, FormProps } from "app/core/components/Form"
import { useField } from "react-final-form"
import { z } from "zod"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export { FORM_ERROR } from "app/core/components/Form"

export function RecordForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  function CustomDatePicker(props: { name: string }) {
    const { input } = useField(props.name)
    const ExampleCustomTimeInput = ({ value, onChange }) => (
      <input type="time" value={value} onChange={(e) => onChange(e.target.value)} />
    )
    return (
      <DatePicker
        dateFormat="dd/MM/yyyy HH:mm"
        selected={input.value}
        onChange={input.onChange}
        showTimeInput
        customTimeInput={<ExampleCustomTimeInput />}
      />
    )
  }
  return (
    <Form<S> {...props}>
      <label htmlFor="begin">Begin</label>
      <CustomDatePicker name="begin" />
      <label htmlFor="end">End</label>
      <CustomDatePicker name="end" />
    </Form>
  )
}
