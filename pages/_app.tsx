import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ConvexProviderWithAuth0 } from 'convex/react-auth0'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import convexConfig from '../convex.json'
import clientConfig from '../convex/_generated/clientConfig'
import { useAuth0 } from '@auth0/auth0-react'
import GamePicker from '../components/game_picker'
import React from 'react'
import { useQuery } from '../convex/_generated/react'
import Card from '../components/card'

const convex = new ConvexReactClient(clientConfig)
const authInfo = convexConfig.authInfo[0]

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
            <button className="btn btn-primary" onClick={loginWithRedirect}>
              Log in
            </button>
          </span>
        </div>
        <Instructions></Instructions>
      </main>
    </ConvexProvider>
  )
}

const Instructions = () => {
  return (
    <div>
      <h2>
        How to play{' '}
        <a href="https://en.wikipedia.org/wiki/Projective_Set_(game)">
          Proset:
        </a>
      </h2>
      <p>The goal of the game is to find a "Proset" amongst the cards shown.</p>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Card
          card={{
            red: true,
            orange: true,
            yellow: true,
            green: false,
            blue: true,
            purple: true,
          }}
          size="mini"
          selectionState="unselected"
        />
        <Card
          card={{
            red: false,
            orange: true,
            yellow: false,
            green: false,
            blue: false,
            purple: false,
          }}
          size="mini"
          selectionState="selected"
        />
        <Card
          card={{
            red: true,
            orange: false,
            yellow: false,
            green: false,
            blue: false,
            purple: true,
          }}
          size="mini"
          selectionState="selected"
        />
        <Card
          card={{
            red: true,
            orange: true,
            yellow: false,
            green: true,
            blue: true,
            purple: false,
          }}
          size="mini"
          selectionState="selected"
        />
        <Card
          card={{
            red: false,
            orange: true,
            yellow: true,
            green: true,
            blue: true,
            purple: true,
          }}
          size="mini"
          selectionState="unselected"
        />
        <Card
          card={{
            red: false,
            orange: true,
            yellow: false,
            green: true,
            blue: true,
            purple: false,
          }}
          size="mini"
          selectionState="selected"
        />
        <Card
          card={{
            red: false,
            orange: true,
            yellow: false,
            green: false,
            blue: false,
            purple: true,
          }}
          size="mini"
          selectionState="selected"
        />
      </div>
      <p>
        A "Proset" is any 3-7 cards where there's an even number of each color
        of dot, like the cards highlighted above.
      </p>
      <p>
        When you think you've found a Proset, click the button to start
        selecting your cards. But be careful -- you lose points if you click the
        button without finding a Proset!
      </p>
    </div>
  )
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConvexProviderWithAuth0
      client={convex}
      authInfo={authInfo}
      loggedOut={<Login />}
    >
      <Component {...pageProps} />
    </ConvexProviderWithAuth0>
  )
}

export default MyApp
