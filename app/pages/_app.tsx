import {
  AppProps,
  ErrorBoundary,
  ErrorComponent,
  AuthenticationError,
  AuthorizationError,
  ErrorFallbackProps,
  useQueryErrorResetBoundary,
} from "blitz"
import LoginForm from "app/auth/components/LoginForm"
import { ChakraProvider, theme as defaultTheme, extendTheme } from "@chakra-ui/react"

console.log(defaultTheme)
const theme = extendTheme({
  colors: {
    brand: {
      "50": "#ECEEF8",
      "100": "#CACFED",
      "200": "#A8B1E1",
      "300": "#8692D5",
      "400": "#6473C9",
      "500": "#4255BD",
      "600": "#354497",
      "700": "#283371",
      "800": "#1A224C",
      "900": "#0D1126",
    },
  },
  components: {
    Container: {
      baseStyle: {
        maxW: "80ch",
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.100",
      },
    },
  },
})
export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <ChakraProvider theme={theme}>
      <ErrorBoundary
        FallbackComponent={RootErrorFallback}
        onReset={useQueryErrorResetBoundary().reset}
      >
        {getLayout(<Component {...pageProps} />)}
      </ErrorBoundary>
    </ChakraProvider>
  )
}

function RootErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <LoginForm onSuccess={resetErrorBoundary} />
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
    )
  }
}
