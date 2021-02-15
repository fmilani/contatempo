import { Link, BlitzPage, useMutation } from "blitz"
import { Heading, Text, Link as ChakraLink, VStack } from "@chakra-ui/react"
import Layout from "app/layouts/Layout"
import logout from "app/auth/mutations/logout"
import { useCurrentUser } from "app/hooks/useCurrentUser"
import { Suspense } from "react"

/*
 * This file is just for a pleasant getting started page for your new app.
 * You can delete everything in here and start from scratch if you like.
 */

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <>
        <button
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
        <div>
          User id: <code>{currentUser.id}</code>
          <br />
          User role: <code>{currentUser.role}</code>
        </div>
      </>
    )
  } else {
    return (
      <VStack>
        <Text>
          New here?{" "}
          <Link href="/signup" passHref>
            <ChakraLink color="teal.500">Signup</ChakraLink>
          </Link>
        </Text>
        <Text>
          Already have an account?{" "}
          <Link href="/login">
            <ChakraLink color="teal.500">Login</ChakraLink>
          </Link>
        </Text>
      </VStack>
    )
  }
}

const Home: BlitzPage = () => {
  return (
    <main>
      <Heading>Contatempo</Heading>
      <Text fontSize="2xl">A simple time tracker</Text>
      <Suspense fallback="Loading...">
        <UserInfo />
      </Suspense>
    </main>
  )
}

Home.getLayout = (page) => <Layout title="Contatempo">{page}</Layout>

export default Home
