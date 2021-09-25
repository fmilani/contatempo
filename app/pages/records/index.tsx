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
  Button,
  ButtonGroup,
  chakra,
  Heading,
  HStack,
  Icon,
  List,
  ListIcon,
  ListItem,
  Spacer,
  useToast,
  VStack,
} from "@chakra-ui/react"
import { TimeIcon } from "@chakra-ui/icons"
import { MdArrowDropDown } from "react-icons/md"

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

const parseDate = (date) => {
  if (!date) return null
  const [year, month, day] = date.split("-")
  if (!year || !month || !day) return null
  return new Date(Number(year), Number(month) - 1, Number(day))
}
export const RecordsList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const from = parseDate(router.query.from)
  const to = parseDate(router.query.to)

  const [range, setRange] = useState<[Date | null, Date | null]>([from, to])
  const [startDate, endDate] = range
  const onChangeRange = (newRange) => {
    setRange(newRange)
    if (newRange[1])
      router.replace(
        Routes.RecordsPage({
          from: format(newRange[0], "yyyy-MM-dd"),
          to: format(newRange[1], "yyyy-MM-dd"),
        })
      )
  }

  const [{ records, hasMore }] = usePaginatedQuery(getRecords, {
    where: {
      begin: {
        gte: from || undefined,
        lte: to ? endOfDay(to) : undefined,
      },
    },
    orderBy: { begin: "desc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [{ finishedRecordsTime, ongoingRecord }] = useQuery(
    getFinishedRecordsTimeAndOngoingRecord,
    {
      where: {
        begin: {
          gte: from || undefined,
          lte: to ? endOfDay(to) : undefined,
        },
      },
    }
  )
  const [now, setNow] = useState(new Date())

  useInterval(() => setNow(new Date()), 1000)
  const goToPreviousPage = () => router.push({ query: { ...router.query, page: page - 1 } })
  const goToNextPage = () => router.push({ query: { ...router.query, page: page + 1 } })

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
  const [sendRecordsMutation, { isLoading: isSendingRecords }] = useMutation(sendRecords)
  const toast = useToast()
  return (
    <div>
      <HStack>
        <Spacer />
        <ButtonGroup py={2} px={[4, 0]} size="sm" variant="outline">
          <Button
            onClick={async () => {
              await sendRecordsMutation({ from, to })
              toast({
                title: "Email sent.",
                description: "We've sent the records of the period to you.",
                status: "success",
                duration: 5000,
                isClosable: true,
              })
            }}
            isLoading={isSendingRecords}
          >
            Email
          </Button>
          <Button colorScheme="brand" onClick={() => router.push(Routes.NewRecordPage())}>
            New
          </Button>
        </ButtonGroup>
      </HStack>
      <HStack py={4} px={[4, 0]}>
        <ReactDatePicker
          dateFormat="dd/MM/yyyy"
          onChange={onChangeRange}
          onCalendarClose={() => {
            if (!endDate) setRange([from, to])
          }}
          startDate={startDate}
          endDate={endDate}
          customInput={
            <VStack spacing={0} align="start" as="button">
              <Heading size="xs">
                Period <Icon as={MdArrowDropDown} />
              </Heading>
              <Heading size="md">
                {from && to
                  ? `${format(from, "dd/MM/yy")} - ${format(to, "dd/MM/yy")}`
                  : "All time"}
              </Heading>
            </VStack>
          }
          todayButton={<Button variant="unstyled">Today</Button>}
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
      {(hasMore || page !== 0) && (
        <HStack padding={4} spacing={4} justify="center">
          <Button disabled={page === 0} onClick={goToPreviousPage}>
            Previous
          </Button>
          <Button disabled={!hasMore} onClick={goToNextPage}>
            Next
          </Button>
        </HStack>
      )}
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
