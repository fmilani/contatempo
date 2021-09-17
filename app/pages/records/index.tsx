import React, { useEffect, useState, useRef, Suspense } from "react"
import {
  Head,
  Link,
  useMutation,
  useQuery,
  usePaginatedQuery,
  useRouter,
  BlitzPage,
  Routes,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getRecords from "app/records/queries/getRecords"
import { Record } from "db"
import getFinishedRecordsTimeAndOngoingRecord from "app/records/queries/getFinishedRecordsTimeAndOngoingRecord"
import { endOfDay, format, intervalToDuration } from "date-fns"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import sendRecords from "app/records/mutations/sendRecords"
import {
  Box,
  chakra,
  Heading,
  HStack,
  List,
  ListIcon,
  ListItem,
  Spacer,
  VStack,
} from "@chakra-ui/react"
import { TimeIcon } from "@chakra-ui/icons"

const ITEMS_PER_PAGE = 100

const useInterval = (callback: any, timer: number) => {
  const intervalIdRef = useRef(() => {})

  useEffect(() => {
    intervalIdRef.current = callback
  }, [callback])

  useEffect(() => {
    const fn = () => {
      intervalIdRef.current()
    }
    if (timer !== null) {
      let intervalId = setInterval(fn, timer)
      return () => clearInterval(intervalId)
    }
  }, [timer])
}

const formatDuration = (duration) =>
  `${("00" + duration.hours).slice(-2)}:${("00" + duration.minutes).slice(-2)}:${(
    "00" + duration.seconds
  ).slice(-2)}`

export const RecordsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0

  const [range, setRange] = useState([null, null])
  const [startDate, endDate] = range
  const onChangeRange = (newRange) => {
    setRange(newRange)
  }
  const [{ records, hasMore }] = usePaginatedQuery(getRecords, {
    where: {
      begin: {
        gte: startDate || undefined,
        lte: endDate ? endOfDay(endDate) : undefined,
      },
    },
    orderBy: { begin: "desc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ finishedRecordsTime, ongoingRecord }] = useQuery(
    getFinishedRecordsTimeAndOngoingRecord,
    {}
  )
  const [now, setNow] = useState(new Date())

  useInterval(() => setNow(new Date()), 1000)
  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  function groupBy(propertyExtractor: (r: Record) => string) {
    return function group(array: Record[]) {
      return array.reduce((acc, obj) => {
        const property = propertyExtractor(obj)
        acc[property] = acc[property] || []
        acc[property].push(obj)
        return acc
      }, {})
    }
  }

  const groupByDay = groupBy(
    (record) =>
      `${record.begin.getFullYear()}-${record.begin.getMonth() + 1}-${record.begin.getDate()}`
  )

  const recordsDuration = {
    hours: Math.floor(finishedRecordsTime / 3600),
    minutes: Math.floor((finishedRecordsTime % 3600) / 60),
  }

  const ongoingDuration = ongoingRecord
    ? intervalToDuration({ start: now, end: ongoingRecord.begin })
    : { hours: 0, minutes: 0, seconds: 0 }
  const totalDurationMinutes = recordsDuration.minutes + (ongoingDuration.minutes ?? 0)
  const totalDuration = {
    hours:
      recordsDuration.hours + (ongoingDuration.hours ?? 0) + Math.floor(totalDurationMinutes / 60),
    minutes: totalDurationMinutes % 60,
    seconds: ongoingDuration.seconds ?? 0,
  }
  const formattedDuration = formatDuration(totalDuration)
  const formatDay = (day) => {
    const [year, month, date] = day.split("-")
    return format(new Date(year, month - 1, date), "EEEE, MMMM dd yyyy")
  }
  const [sendRecordsMutation] = useMutation(sendRecords)
  return (
    <div>
      <button
        style={{ display: "block" }}
        onClick={() => sendRecordsMutation({ startDate, endDate })}
      >
        Send email
      </button>
      <HStack py={4} px={[4, 0]}>
        <ReactDatePicker
          dateFormat="dd/MM/yyyy"
          selected={startDate}
          onChange={onChangeRange}
          startDate={startDate}
          endDate={endDate}
          customInput={
            <VStack spacing={0} align="start" as="button">
              <Heading size="xs">Period</Heading>
              <Heading size="md">
                {startDate && endDate
                  ? `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`
                  : "All time"}
              </Heading>
            </VStack>
          }
          selectsRange
          withPortal
        />
        <Spacer />
        <VStack spacing={0} align="end">
          <Heading size="xs">Total</Heading>
          <Heading size="md">{formattedDuration}</Heading>
        </VStack>
      </HStack>
      <VStack spacing={4}>
        {Object.entries(groupByDay(records)).map(([day, records]) => (
          <Box key={day} p={4} borderWidth="1px" bg="white" shadow="sm" w="full">
            <Heading size="sm" mb={4}>
              {formatDay(day)}
            </Heading>
            <List spacing={2}>
              {(records as Record[]).reverse().map((record: Record) => (
                <ListItem key={record.id} d="flex" alignItems="center">
                  <ListIcon as={TimeIcon} w={3} mb={1} />
                  <Link href={Routes.ShowRecordPage({ recordId: record.id })} passHref>
                    <chakra.a aria-label={`Navigate to record with id ${record.id}`}>
                      {format(record.begin, "HH:mm")} -{" "}
                      {record.end ? format(record.end, "HH:mm") : "in progress"}
                    </chakra.a>
                  </Link>
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </VStack>
      <button disabled={page === 0} onClick={goToPreviousPage}>
        Previous
      </button>
      <button disabled={!hasMore} onClick={goToNextPage}>
        Next
      </button>
    </div>
  )
}

const RecordsPage: BlitzPage = () => {
  return (
    <>
      <Head>
        <title>Records</title>
      </Head>

      <div>
        <Suspense fallback={<div>Loading...</div>}>
          <RecordsList />
        </Suspense>
      </div>
    </>
  )
}

RecordsPage.authenticate = true
RecordsPage.getLayout = (page) => <Layout>{page}</Layout>

export default RecordsPage
