import { useRouter } from 'next/router'
import React, { useState } from 'react'
import Game from '../../components/game'
import MessageViewer from '../../components/message_viewer'
import { Id } from '../../convex/_generated/dataModel'
import { usePaginatedQuery, useQuery } from '../../convex/_generated/react'

const GameBoundary = (props: {}) => {
  const router = useRouter()
  const gameId = new Id('Game', router.query.gameId as string)
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
        {status === 'Exhausted' ? <div>Out of cards!</div> : null}
        <MessageViewer gameId={gameId}></MessageViewer>
      </React.Fragment>
    )
  }
}

export default GameBoundary
