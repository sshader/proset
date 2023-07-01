import { useMutation, usePaginatedQuery, useQuery } from 'convex/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Game from '../../components/Game'
import GameDetails from '../../components/GameDetails'
import Sidebar from '../../components/Sidebar'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'

const GameBoundary = () => {
  const router = useRouter()
  const gameId: Id<'Game'> = router.query.gameId as Id<'Game'>
  const joinGame = useMutation(api.api.players.joinGame)
  const [ready, setReady] = useState(false)

  joinGame({ gameId })
    .then(() => setReady(true))
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
  const gameInfo = useQuery(api.games.getInfo, { gameId })
  if (gameInfo !== undefined && gameInfo !== latestKnownGameInfo) {
    setLatestKnownGameInfo(() => gameInfo as any)
  }

  const { results, status, loadMore } = usePaginatedQuery(
    api.dealCards.default,
    { gameId },
    {
      initialNumItems: 7,
    }
  )
  useEffect(() => {
    if (results.length < 7 && status === 'CanLoadMore') {
      loadMore(7 - results.length)
    }
  }, [results, status, loadMore])
  if (
    latestKnownGameInfo === undefined ||
    (results.length === 0 && status !== 'Exhausted')
  ) {
    return <div>Loading</div>
  } else if (results.length === 0 && status === 'Exhausted') {
    return (
      <div
        className="Container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div>Game complete! 👏 Summary</div>
        <GameDetails gameInfo={latestKnownGameInfo} showProsets={true} />
      </div>
    )
  } else {
    return (
      <div className="Container flex">
        <Sidebar gameInfo={latestKnownGameInfo} />
        <Game gameInfo={latestKnownGameInfo} cards={{ results, status }} />
      </div>
    )
  }
}

export default GameBoundary
