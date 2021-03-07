import { ReactNode, Suspense, useEffect, useRef, useState } from "react"
import { Head, invalidateQuery, Link, useMutation, useQuery } from "blitz"
import { Box, Container, Flex, Heading } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/react"
import { useViewportScroll } from "framer-motion"
import getRecords from "app/records/queries/getRecords"
import createRecord from "app/records/mutations/createRecord"
import { useCurrentUser } from "../hooks/useCurrentUser"
import updateRecord from "app/records/mutations/updateRecord"

type LayoutProps = {
  title?: string
  children: ReactNode
}

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "contatempo"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <Container p="0" maxW="800px" centerContent marginTop="calc(4.5rem + 6px)">
        {children}
      </Container>
    </>
  )
}

const StartStop = () => {
  const user = useCurrentUser()
  const [{ records: recordsInProgress }, { refetch }] = useQuery(getRecords, {
    where: { finish: null },
    orderBy: { finish: "asc" },
    skip: 0,
    take: 1,
  })
  const [createRecordMutation] = useMutation(createRecord)
  const [updateRecordMutation] = useMutation(updateRecord)
  const saveRecord = async () => {
    try {
      const record = await createRecordMutation({
        data: {
          start: new Date(),
          user: { connect: { id: user?.id } },
        },
      })
      refetch()
      invalidateQuery(getRecords)
    } catch (error) {
      alert("Error creating record " + JSON.stringify(error, null, 2))
    }
  }

  const updateRecordInProgress = async () => {
    try {
      const updated = await updateRecordMutation({
        where: { id: recordsInProgress[0].id },
        data: { finish: new Date() },
      })
      refetch()
      invalidateQuery(getRecords)
    } catch (error) {
      alert("Error editing record " + JSON.stringify(error, null, 2))
    }
  }

  return (
    <Flex
      align="center"
      onClick={() => (recordsInProgress.length > 0 ? updateRecordInProgress() : saveRecord())}
    >
      {recordsInProgress.length > 0 ? "Stop" : "Start"}
    </Flex>
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
      shadow={y > height ? "md" : undefined}
      transition="box-shadow 0.2s"
      bg="white"
      pos="fixed"
      width="full"
      borderTop="6px solid"
      borderTopColor="brand.500"
      top="0"
      left="0"
      right="0"
    >
      <chakra.div height="4.5rem" mx="auto" maxW="800px">
        <Flex w="100%" h="100%" align="center" justify="space-between">
          <Flex align="center">
            <Link href="/" passHref>
              <chakra.a display="block" aria-label="Contatempo, Back to homepage">
                <Heading size="md">Contatempo</Heading>
              </chakra.a>
            </Link>
          </Flex>
          <Flex w="100%" px="6" align="center">
            <Link href="/records" passHref>
              <chakra.a aria-label="Navigate to records page">Records</chakra.a>
            </Link>
          </Flex>
          <Suspense fallback="Loading...">
            <StartStop />
          </Suspense>
        </Flex>
      </chakra.div>
    </chakra.header>
  )
}

export default Layout
