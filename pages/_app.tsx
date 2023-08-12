import {
  ClerkProvider,
  SignInButton,
  UserButton,
  useAuth,
} from '@clerk/clerk-react'
import { Authenticated, ConvexReactClient, Unauthenticated } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import type { AppProps } from 'next/app'
import process from 'process'
import { StrictMode } from 'react'

import Head from 'next/head'
import Instructions from '../components/Instructions'
import { SessionProvider } from '../hooks/SessionProvider'
import '../styles/globals.css'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!, {
  verbose: true,
  reportDebugInfoToConvex: true,
})

export function Login() {
  return (
    <main>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          padding: 5,
        }}
      >
        <SignInButton mode="modal">
          <button className="btn btn-primary">Sign in</button>
        </SignInButton>
      </div>
      <h1 className="text-center">Proset</h1>

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
        <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
          <Unauthenticated>
            <SessionProvider>
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  padding: 5,
                }}
              >
                <SignInButton mode="modal">
                  <button className="btn btn-primary">Sign in</button>
                </SignInButton>
              </div>
              <Component {...pageProps} />
            </SessionProvider>
          </Unauthenticated>
          <Authenticated>
            <SessionProvider>
              <div>
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    padding: 5,
                  }}
                >
                  <UserButton afterSignOutUrl="/"></UserButton>
                </div>
                <Component {...pageProps} />
              </div>
            </SessionProvider>
          </Authenticated>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </StrictMode>
  )
}

export default MyApp
