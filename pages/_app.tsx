import { ClerkProvider, SignInButton, UserButton } from '@clerk/clerk-react'
import { Authenticated, ConvexReactClient, Unauthenticated } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { AppProps } from 'next/app'
import process from 'process'
import { StrictMode } from 'react'

import Head from 'next/head'
import Instructions from '../components/Instructions'
import '../styles/globals.css'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: true,
  reportDebugInfoToConvex: true,
})

export function Login() {
  return (
    <main>
      <h1 className="text-center">Proset</h1>
      <SignInButton mode="modal" />
      <Instructions />
    </main>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <Head>
        <title>Proset</title>
      </Head>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
      >
        <ConvexProviderWithClerk client={convex}>
          <Unauthenticated>
            <Login />
          </Unauthenticated>
          <Authenticated>
            <div>
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  padding: 5,
                }}
              >
                <UserButton></UserButton>
              </div>
              <Component {...pageProps} />
            </div>
          </Authenticated>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </StrictMode>
  )
}

export default MyApp
