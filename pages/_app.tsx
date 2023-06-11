import { Auth0Provider, useAuth0 } from '@auth0/auth0-react'
import {
  Authenticated,
  ConvexProvider,
  ConvexReactClient,
  Unauthenticated,
} from 'convex/react'
import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
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
  const { isLoading, loginWithRedirect } = useAuth0()
  if (isLoading) {
    return <button className="btn btn-primary">Loading...</button>
  }
  return (
    <ConvexProvider client={convex}>
      <main>
        <h1 className="text-center">Proset</h1>
        <div className="text-center">
          <span>
            <button
              className="btn btn-primary"
              onClick={() => loginWithRedirect()}
            >
              Log in
            </button>
          </span>
        </div>
        <Instructions />
      </main>
    </ConvexProvider>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StrictMode>
      <Head>
        <title>Proset</title>
      </Head>
      <Auth0Provider
        domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
        clientId={process.env.NEXT_PUBLIC_CLIENT_ID!}
        authorizationParams={{
          redirect_uri:
            typeof window === 'undefined' ? '' : window.location.origin,
        }}
        useRefreshTokens={true}
        cacheLocation="localstorage"
      >
        <ConvexProviderWithAuth0 client={convex}>
          <Unauthenticated>
            <Login />
          </Unauthenticated>
          <Authenticated>
            <Component {...pageProps} />
          </Authenticated>
        </ConvexProviderWithAuth0>
      </Auth0Provider>
    </StrictMode>
  )
}

export default MyApp
