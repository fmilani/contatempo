import { Suspense } from "react"
import Layout from "app/core/layouts/Layout"
import { Link, usePaginatedQuery, useRouter, BlitzPage } from "blitz"
import getRecords from "app/records/queries/getRecords"
import { useCurrentUser } from "app/hooks/useCurrentUser"
import { Box, Divider, Heading, List, ListIcon, ListItem, VStack } from "@chakra-ui/layout"
import { TimeIcon } from "@chakra-ui/icons"

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

  const groupByDay = groupBy((record) => `${record.start.getMonth() + 1}/${record.start.getDate()}`)
  const groupedRecords = groupByDay(records)

  return (
    <>
      <VStack spacing="4">
        {Object.entries(groupedRecords).map(([day, records]) => {
          return (
            <Box key={day} w="100%">
              <Heading size="sm">{day}</Heading>
              <Box p="6" borderWidth="1px" borderRadius="lg" boxShadow="base">
                <List spacing="2">
                  {records.map((record, index) => (
                    <>
                      <ListItem key={record.id} display="flex" alignItems="center">
                        <ListIcon as={TimeIcon} w="0.75rem" mb="3px" />
                        <Link href={`/records/${record.id}`}>
                          <a>
                            {record.start.toString()} - {record.finish?.toString()}
                          </a>
                        </Link>
                      </ListItem>
                      {index !== records.length - 1 && <Divider />}
                    </>
                  ))}
                </List>
              </Box>
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
    </>
  )
}

const RecordsPage: BlitzPage = () => {
  return (
    <div>
      <p>
        <Link href="/records/new">
          <a>Create Record</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <RecordsList />
      </Suspense>
    </div>
  )
}

RecordsPage.getLayout = (page) => <Layout title={"Records"}>{page}</Layout>

export default RecordsPage
