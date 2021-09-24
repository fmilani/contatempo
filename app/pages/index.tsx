import { BlitzPage, useQuery } from "blitz"
import Layout from "app/core/layouts/Layout"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { Suspense, useState } from "react"
import {
  Box,
  Center,
  Heading,
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  useInterval,
  Wrap,
  WrapItem,
} from "@chakra-ui/react"
import getFinishedRecordsTimeAndOngoingRecord from "app/records/queries/getFinishedRecordsTimeAndOngoingRecord"
import {
  endOfDay,
  endOfMonth,
  endOfToday,
  endOfWeek,
  format,
  formatDuration,
  intervalToDuration,
  isSameDay,
  startOfMonth,
  startOfToday,
  startOfWeek,
} from "date-fns"

const LoginOrSignupMessage = () => (
  <Center>
    <Heading size="md">Please login or sign up!</Heading>
  </Center>
)
const Summary = ({ label, startDate, endDate }) => {
  const [{ finishedRecordsTime, ongoingRecord }] = useQuery(
    getFinishedRecordsTimeAndOngoingRecord,
    {
      where: {
        begin: {
          gte: startDate || undefined,
          lte: endDate ? endOfDay(endDate) : undefined,
        },
      },
    }
  )
  const [now, setNow] = useState(new Date())

  useInterval(() => setNow(new Date()), 1000)

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
  return (
    <Box p={4} borderWidth="1px" bg="white" shadow="sm">
      <Stat>
        <StatLabel>{label}</StatLabel>
        <StatNumber>{formatDuration(totalDuration, { format: ["hours", "minutes"] })}</StatNumber>
        <StatHelpText>
          {format(startDate, "MMM dd")}
          {!isSameDay(startDate, endDate) && ` - ${format(endDate, "MMM dd")}`}
        </StatHelpText>
      </Stat>
    </Box>
  )
}
const Home: BlitzPage = () => {
  const currentUser = useCurrentUser()
  if (!currentUser) return <LoginOrSignupMessage />
  return (
    <SimpleGrid px={[4, 0]} spacing={4} minChildWidth="316px">
      <Summary label="Today" startDate={startOfToday()} endDate={endOfToday()} />
      <Summary
        label="This week"
        startDate={startOfWeek(startOfToday(), { weekStartsOn: 1 })}
        endDate={endOfWeek(startOfToday(), { weekStartsOn: 1 })}
      />
      <Summary
        label="This month"
        startDate={startOfMonth(startOfToday())}
        endDate={endOfMonth(startOfToday())}
      />
    </SimpleGrid>
  )
}

Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => (
  <Layout title="Home">
    <Suspense fallback="Loading...">{page}</Suspense>
  </Layout>
)

export default Home
