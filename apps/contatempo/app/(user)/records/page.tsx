import { getRecords, getTags } from "@/lib/api"
import { zonedTimeToUtc } from "date-fns-tz"
import RecordsList from "@/components/RecordsList"
import { RecordsRange } from "@/components/RecordsRange"
import type { Metadata } from "next"
import { TagFilter } from "@/components/TagFilter"
import { sendRecordsReportEmail } from "actions"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Records | Contatempo",
  description: "Track your time",
}

export default async function RecordsPage(props: {
  searchParams?: Promise<{ from: string; to: string; tags: string[] }>
}) {
  const searchParams = await props.searchParams
  const fromParam = searchParams?.from ?? "2020-01-01"
  const toParam = searchParams?.to ?? "2025-12-31"
  const tags = searchParams?.tags ?? []
  const tagsParam = typeof tags === "string" ? [tags] : tags
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-1">
        <RecordsRange />
        <Tags tagsParam={tagsParam} />
      </div>
      <Records from={fromParam} to={toParam} tags={tagsParam} />
    </div>
  )
}

async function Tags({ tagsParam }: { tagsParam: string[] }) {
  const tags = await getTags()
  return <TagFilter tags={tags} tagsParam={tagsParam} />
}

interface RecordsProps {
  from: string
  to: string
  tags: string[]
}
async function Records({ from, to, tags }: RecordsProps) {
  const allTags = await getTags()
  const fromDate = zonedTimeToUtc(`${from} 00:00:00`, "America/Sao_Paulo")
  const toDate = zonedTimeToUtc(`${to} 23:59:59`, "America/Sao_Paulo")
  const records = await getRecords({
    from: fromDate,
    to: toDate,
    tags: tags
      .map((tag) => {
        const foundTag = allTags.find((t) => t.value === tag)
        if (!foundTag) return ""
        return foundTag.id
      })
      .filter((t) => t),
  })
  return (
    <>
      <form
        action={async () => {
          "use server"
          await sendRecordsReportEmail({ from, to }, records)
        }}
      >
        <div className="flex flex-row-reverse">
          <Button variant="outline">Send records report</Button>
        </div>
      </form>
      <RecordsList
        records={records}
        tags={allTags}
        from={fromDate}
        to={toDate}
      />
    </>
  )
}
