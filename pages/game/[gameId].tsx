import { usePaginatedQuery } from 'convex/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import EndGameButton from '../../components/EndGameButton'
import Game from '../../components/Game'
import GameDetails from '../../components/GameDetails'
import Sidebar from '../../components/Sidebar'
import { api } from '../../convex/_generated/api'
import { Id } from '../../convex/_generated/dataModel'
import { GameInfoProvider } from '../../hooks/GameInfoProvider'
import { useSessionMutation } from '../../hooks/SessionProvider'

const GameBoundary = () => {
  const router = useRouter()
  const gameId: Id<'Games'> = router.query.gameId as Id<'Games'>
  const joinGame = useSessionMutation(api.players.joinGame)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    joinGame({ gameId })
      .then(() => {
        setReady(true)
      })
      .catch((e) => {
        void router.push({
          pathname: "/"
        })
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

const InnerGameBoundary = ({ gameId }: { gameId: Id<'Games'> }) => {
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
      <div className="Container flex flex-col items-center gap-5">
        <div>Game complete! 👏 Summary</div>
        <GameDetails showProsets={true} />
        <EndGameButton />
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
