import React, { ReactNode, useEffect, useRef, useState } from "react"
import { Head, Link } from "blitz"
import { Container, Flex, Heading } from "@chakra-ui/layout"
import { chakra, HStack, Spacer } from "@chakra-ui/react"
import { useViewportScroll } from "framer-motion"

type LayoutProps = {
  title?: string
  children: ReactNode
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
      <Container p={[0, 4]}>{children}</Container>
    </>
  )
}

export default Layout
