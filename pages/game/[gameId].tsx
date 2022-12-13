import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Game from '../../components/game'
import MessageViewer from '../../components/message_viewer'
import { Id } from '../../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../../convex/_generated/react'

const GameBoundary = () => {
  const router = useRouter()
  const gameIdStr: string | undefined = router.query.gameId as
    | string
    | undefined
  const joinGame = useMutation('joinGame')
  const [ready, setReady] = useState(false)
  if (gameIdStr === undefined) {
    return <div>Loading...</div>
  }
  const gameId = new Id('Game', gameIdStr)

  joinGame(gameId)
    .then(() => {
      setReady(true)
    })
    .catch((e) => {
      throw e
    })
  if (ready) {
    return <InnerGameBoundary gameId={gameId}></InnerGameBoundary>
  } else {
    return <div>Loading...</div>
  }
}

const InnerGameBoundary = ({ gameId }: { gameId: Id<'Game'> }) => {
  const [latestKnownGameInfo, setLatestKnownGameInfo] = useState(undefined)
  const gameInfo = useQuery('getGameInfo', gameId)
  if (gameInfo !== undefined && gameInfo !== latestKnownGameInfo) {
    setLatestKnownGameInfo(() => gameInfo as any)
  }

  const { results, status, loadMore } = usePaginatedQuery(
    'dealCards',
    {
      initialNumItems: 7,
    },
    gameId
  )
  const endGame = useMutation('endGame')
  const router = useRouter()
  if (
    latestKnownGameInfo === undefined ||
    (results.length === 0 && status !== 'Exhausted')
  ) {
    return <div>Loading</div>
  } else {
    if (results.length < 7 && status === 'CanLoadMore') {
      loadMore(7 - results.length)
    }
    return (
      <React.Fragment>
        <Game gameInfo={latestKnownGameInfo} cards={results}></Game>
        {status === 'Exhausted' ? (
          <div style={{ justifyContent: 'center', display: 'flex' }}>
            <button
              onClick={async () => {
                await endGame(gameId)
                await router.push('/')
              }}
            >
              Out of cards! -- End Game
            </button>
          </div>
        ) : null}
        <MessageViewer gameId={gameId}></MessageViewer>
      </React.Fragment>
    )
  }
}

export default GameBoundary
