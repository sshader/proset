import { gql } from '@apollo/client'
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
import '../../types/graphql_schema'

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

  joinGame({ gameId })
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

const prosetQuery = gql`
  fragment prosets on Player {
    prosets {
      cards(gameId: $id) {
        id
        red
        orange
        yellow
        green
        blue
        purple
      }
    }
  }
`

const getGameInfoQuery = gql`
  query GameInfo($id: String!) {
    game(id: $id) {
      id
      currentPlayer {
        id
        ...prosets
      }
      allPlayers {
        id
        ...prosets
      }
    }
  }
  ${prosetQuery}
`

const InnerGameBoundary = ({ gameId }: { gameId: Id<'Game'> }) => {
  const [latestKnownGameInfo, setLatestKnownGameInfo] = useState(undefined)

  console.log(getGameInfoQuery.loc?.source.body)
  const gameInfo = useQuery('graphql', {
    query: getGameInfoQuery.loc?.source.body,
    variables: { id: gameId.id },
  })
  console.log(gameInfo)
  if (gameInfo !== undefined && gameInfo.data !== latestKnownGameInfo) {
    setLatestKnownGameInfo(() => gameInfo.data as any)
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
