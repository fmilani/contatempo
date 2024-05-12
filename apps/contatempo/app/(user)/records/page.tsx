import { getRecords, getTags } from "@/lib/api"
import { zonedTimeToUtc } from "date-fns-tz"
import { Suspense } from "react"
import RecordsList from "@/components/RecordsList"
import { RecordsRange } from "@/components/RecordsRange"
import type { Metadata } from "next"
import { TagFilter } from "@/components/TagFilter"

export const metadata: Metadata = {
  title: "Records | Contatempo",
  description: "Track your time",
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: { from: string; to: string; tags: string[] }
}) {
  const fromParam = searchParams?.from ?? "2020-01-01"
  const toParam = searchParams?.to ?? "2025-12-31"
  const tags = searchParams?.tags ?? []
  const tagsParam = typeof tags === "string" ? [tags] : tags
  return (
    <div className="space-y-2">
      <div>
        <div>
          <RecordsRange />
        </div>
        <div>
          <Tags />
        </div>
      </div>
      <Suspense
        key={`${fromParam}-${toParam}-${tagsParam}`}
        fallback="carregando"
      >
        <Records from={fromParam} to={toParam} tags={tagsParam} />
      </Suspense>
    </div>
  )
}

async function Tags() {
  const tags = await getTags()
  return <TagFilter tags={tags} />
}

interface RecordsProps {
  from: string
  to: string
  tags: string[]
}
async function Records({ from, to, tags }: RecordsProps) {
  const allTags = await getTags()
  const records = await getRecords({
    from: zonedTimeToUtc(`${from} 00:00:00`, "America/Sao_Paulo"),
    to: zonedTimeToUtc(`${to} 23:59:59`, "America/Sao_Paulo"),
    tags: tags
      .map((tag) => {
        const foundTag = allTags.find((t) => t.value === tag)
        if (!foundTag) return ""
        return foundTag.id
      })
      .filter((t) => t),
  })
  return <RecordsList records={records} tags={allTags} />
}
