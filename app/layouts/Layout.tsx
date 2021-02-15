import { ReactNode } from "react"
import { Head } from "blitz"
import { Container } from "@chakra-ui/react"

type LayoutProps = {
  title?: string
  children: ReactNode
}

const Layout = ({ title, children }: LayoutProps) => {
  return (
    <>
      <Head>
        <title>{title || "blitzapp"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container centerContent>{children}</Container>
    </>
  )
}

export default Layout
