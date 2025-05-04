import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "./ui/button"
import { useForm } from "react-hook-form"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function NewRecordForm({ day }) {
  const [open, setOpen] = useState(false)
  const form = useForm({
    defaultValues: {
      start: "",
      end: "",
    },
  })
  const router = useRouter()
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full h-full rounded-none px-2 texts"
          onClick={() => {
            console.log("abriu")
          }}
        >
          <div className="flex flex-col gap-1 w-full">
            <div className="w-full flex justify-between items-end">
              No record on this day. Record?
            </div>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Record on {day}</DialogTitle>
          <DialogDescription>What did you do on this day?</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id="new-record-form"
            onSubmit={form.handleSubmit(async (values) => {
              console.log(values)
              await fetch(`/api/records`, {
                method: "POST",
                body: JSON.stringify({
                  begin: new Date(day + "T" + values.start),
                  end: new Date(day + "T" + values.end),
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              })
              setOpen(false)
              router.refresh()
            })}
          >
            <FormField
              control={form.control}
              name="start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>What time did start.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="end"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormDescription>What time did you finish.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type="submit" form="new-record-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
