import { Suspense } from "react"
import Layout from "app/core/layouts/Layout"
import { Link, usePaginatedQuery, useRouter, BlitzPage } from "blitz"
import getRecords from "app/records/queries/getRecords"
import { useCurrentUser } from "app/hooks/useCurrentUser"
import {
  Box,
  Divider,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
} from "@chakra-ui/layout"
import { TimeIcon } from "@chakra-ui/icons"
import { format, formatDuration, intervalToDuration } from "date-fns"

const ITEMS_PER_PAGE = 100

export const RecordsList = () => {
  const router = useRouter()
  const user = useCurrentUser()
  const page = Number(router.query.page) || 0
  const [{ records, hasMore }] = usePaginatedQuery(getRecords, {
    where: { userId: user?.id },
    orderBy: { start: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  function groupBy(propertyExtractor) {
    return function group(array) {
      return array.reduce((acc, obj) => {
        const property = propertyExtractor(obj)
        acc[property] = acc[property] || []
        acc[property].push(obj)
        return acc
      }, {})
    }
  }

  const groupByDay = groupBy(
    (record) => `${record.start.getFullYear()}-${record.start.getMonth()}-${record.start.getDate()}`
  )
  const groupedRecords = groupByDay(records)

  const formatDay = (date) => {
    const [year, month, day] = date.split("-")
    return format(new Date(year, month, day), "EEEE, MMMM dd yyyy")
  }

  return (
    <Box>
      <VStack spacing="4">
        {Object.entries(groupedRecords).map(([day, records]) => {
          return (
            <Box key={day} w="100%" p="4" borderWidth="1px" borderRadius="lg" boxShadow="base">
              <Heading size="sm" mb="4">
                {formatDay(day)}
              </Heading>
              <List spacing="4">
                {records.map((record, index) => {
                  return (
                    <ListItem key={record.id} display="flex" alignItems="center">
                      <ListIcon as={TimeIcon} w="0.75rem" mb="3px" />
                      <Link href={`/records/${record.id}`}>
                        <a>
                          <Record start={record.start} finish={record.finish} />
                        </a>
                      </Link>
                    </ListItem>
                  )
                })}
              </List>
            </Box>
          )
        })}
      </VStack>
      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </Box>
  )
}

const Record = ({ start, finish }) => (
  <HStack spacing="8">
    <span>
      {format(start, "HH:mm")} -{" "}
      {finish
        ? `${format(finish, "HH:mm")} (
      ${formatDuration(intervalToDuration({ start, end: finish }))})`
        : "in progress"}
    </span>
  </HStack>
)

const RecordsPage: BlitzPage = () => {
  return (
    <Box w="100%">
      <p>
        <Link href="/records/new">
          <a>Create Record</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <RecordsList />
      </Suspense>
    </Box>
  )
}

RecordsPage.getLayout = (page) => <Layout title={"Records"}>{page}</Layout>

export default RecordsPage
