import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Game from '../../components/Game'
import GameDetails from '../../components/GameDetails'
import Sidebar from '../../components/Sidebar'
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
  const [gameId, setGameId] = useState<Id<'Game'> | null>(null)
  if (gameIdStr === undefined) {
    return <div>Loading...</div>
  }

  joinGame({ gameIdStr })
    .then((id) => {
      if (id !== null) {
        setGameId(id)
      } else {
        void router.push('/')
      }
    })
    .catch((e) => {
      throw e
    })
  if (gameId !== null) {
    return <InnerGameBoundary gameId={gameId}></InnerGameBoundary>
  } else {
    return <div>Loading...</div>
  }
}

const InnerGameBoundary = ({ gameId }: { gameId: Id<'Game'> }) => {
  const [latestKnownGameInfo, setLatestKnownGameInfo] = useState(undefined)
  const gameInfo = useQuery('getGameInfo', { gameId })
  if (gameInfo !== undefined && gameInfo !== latestKnownGameInfo) {
    setLatestKnownGameInfo(() => gameInfo as any)
  }

  const { results, status, loadMore } = usePaginatedQuery(
    'dealCards',
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
      <div className="Container">
        <Sidebar gameInfo={latestKnownGameInfo} />
        <Game gameInfo={latestKnownGameInfo} cards={{ results, status }} />
      </div>
    )
  }
}

export default GameBoundary
