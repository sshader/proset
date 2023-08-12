import { usePaginatedQuery } from 'convex/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Game from '../../components/Game'
import GameDetails from '../../components/GameDetails'
import Sidebar from '../../components/Sidebar'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { GameInfoProvider } from '../../hooks/GameInfoProvider'
import { useSessionMutation } from '../../hooks/SessionProvider'

const GameBoundary = () => {
  const router = useRouter()
  const gameId: Id<'Game'> = router.query.gameId as Id<'Game'>
  const joinGame = useSessionMutation(api.players.joinGame)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    joinGame({ gameId })
      .then(() => {
        setReady(true)
      })
      .catch((e) => {
        throw e
      })
  })

  if (ready) {
    return (
      <GameInfoProvider gameId={gameId}>
        <InnerGameBoundary gameId={gameId} />
      </GameInfoProvider>
    )
  } else {
    return <div>Loading...</div>
  }
}

const InnerGameBoundary = ({ gameId }: { gameId: Id<'Game'> }) => {
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
  if (results.length === 0 && status !== 'Exhausted') {
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
        <GameDetails showProsets={true} />
      </div>
    )
  } else {
    return (
      <div className="Container flex">
        <Sidebar />
        <Game cards={{ results, status }} />
      </div>
    )
  }
}

export default GameBoundary
