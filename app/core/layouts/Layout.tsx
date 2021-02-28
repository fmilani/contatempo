import { ReactNode, useEffect, useRef, useState } from "react"
import { Head, Link } from "blitz"
import { Box, Container, Flex, Heading } from "@chakra-ui/layout"
import { chakra } from "@chakra-ui/react"
import { useViewportScroll } from "framer-motion"

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
      <Container maxW="800px" centerContent marginTop="calc(4.5rem + 6px)">
        {children}
      </Container>
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
            <Link href="/records">
              <chakra.a aria-label="Navigate to records page">Records</chakra.a>
            </Link>
          </Flex>
        </Flex>
      </chakra.div>
    </chakra.header>
  )
}

export default Layout
