import React, { ReactNode, Suspense, useEffect, useRef, useState } from "react"
import { Head, invalidateQuery, Link, useMutation, useQuery } from "blitz"
import { Container, Heading } from "@chakra-ui/layout"
import {
  Badge,
  Box,
  Button,
  chakra,
  Collapse,
  HStack,
  Icon,
  IconButton,
  Portal,
  Spacer,
  useInterval,
} from "@chakra-ui/react"
import { useViewportScroll } from "framer-motion"
import { intervalToDuration } from "date-fns"
import getRecords from "app/records/queries/getRecords"
import createRecord from "app/records/mutations/createRecord"
import updateRecord from "app/records/mutations/updateRecord"
import getFinishedRecordsTimeAndOngoingRecord from "app/records/queries/getFinishedRecordsTimeAndOngoingRecord"
import { MdPlayArrow, MdStop } from "react-icons/md"

type LayoutProps = {
  title?: string
  children: ReactNode
}

const StartStopAndOngoing = ({ headerRef }) => {
  const [{ records: ongoingRecords }] = useQuery(getRecords, {
    where: { end: null },
    orderBy: { begin: "asc" },
    skip: 0,
    take: 1,
  })
  const [now, setNow] = useState(new Date())
  useInterval(() => setNow(new Date()), 1000)

  const ongoingDuration =
    ongoingRecords.length > 0
      ? intervalToDuration({ start: now, end: ongoingRecords[0]!!.begin })
      : { hours: 0, minutes: 0, seconds: 0 }
  const [createRecordMutation] = useMutation(createRecord)
  const [updateRecordMutation] = useMutation(updateRecord)

  const saveOrUpdateRecord = async () => {
    if (ongoingRecords.length == 0) {
      try {
        await createRecordMutation({
          begin: new Date(),
        })
        invalidateQuery(getRecords)
        invalidateQuery(getFinishedRecordsTimeAndOngoingRecord)
      } catch (error) {
        alert("Error creating record " + JSON.stringify(error, null, 2))
      }
    } else {
      try {
        const ongoingRecord = ongoingRecords[0]!!
        await updateRecordMutation({
          id: ongoingRecord.id,
          begin: ongoingRecord.begin,
          end: new Date(),
        })
        invalidateQuery(getRecords)
        invalidateQuery(getFinishedRecordsTimeAndOngoingRecord)
      } catch (error) {
        alert("Error editing record " + JSON.stringify(error, null, 2))
      }
    }
  }

  const formatDuration = (duration) =>
    `${("00" + duration.hours).slice(-2)}:${("00" + duration.minutes).slice(-2)}:${(
      "00" + duration.seconds
    ).slice(-2)}`

  return (
    <>
      <IconButton
        aria-label="Start a record"
        icon={<Icon w={10} h={10} as={ongoingRecords.length > 0 ? MdStop : MdPlayArrow} />}
        variant="ghost"
        onClick={() => saveOrUpdateRecord()}
      />
      <Portal containerRef={headerRef}>
        <Collapse in={ongoingRecords.length > 0}>
          <Container>
            <Box>
              {formatDuration(ongoingDuration)}
              <Badge ml={1}>Now</Badge>
            </Box>
          </Container>
        </Collapse>
      </Portal>
    </>
  )
}

const Header = () => {
  const ref = useRef<HTMLHeadingElement>(null)
  const [y, setY] = useState(0)
  const { height = 0 } = ref.current?.getBoundingClientRect() ?? {}

  const { scrollY } = useViewportScroll()
  useEffect(() => {
    return scrollY.onChange(() => setY(scrollY.get()))
  }, [scrollY])

  return (
    <chakra.header
      ref={ref}
      shadow={y > height / 2 ? "md" : undefined}
      transition="box-shadow 0.2s"
      bg="white"
      pos="sticky"
      width="full"
      borderTop="4px solid"
      borderTopColor="brand.500"
      top="0"
      left="0"
      right="0"
      zIndex="999"
    >
      <Container height={[14, 16]} display="flex" alignItems="center">
        <Link href="/" passHref>
          <chakra.a aria-label="Contatempo, Back to homepage">
            <Heading size="md">Contatempo</Heading>
          </chakra.a>
        </Link>
        <Spacer />
        <HStack spacing="4">
          <Link href="/records" passHref>
            <chakra.a aria-label="Navigate to records page">Records</chakra.a>
          </Link>
          <Suspense fallback={<div>Loading...</div>}>
            <StartStopAndOngoing headerRef={ref} />
          </Suspense>
        </HStack>
      </Container>
    </chakra.header>
  )
}

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "contatempo"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Container mb={16} py={4} px={[0, 4]}>
        {children}
      </Container>
    </>
  )
}

export default Layout
