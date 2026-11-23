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
      <div className="fixed top-3 right-3 z-50">
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string}
      >
        <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
          <Unauthenticated>
            <SessionProvider>
              <div className="fixed top-3 right-3 z-50">
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
                <div className="fixed top-3 right-3 z-50">
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
