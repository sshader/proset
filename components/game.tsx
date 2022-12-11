import React, { FormEvent, useEffect, useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../convex/_generated/react'
import Timer from './timer'
import Card from './card'
import CardContainer from './card_container'

type GameInfo = {
  game: Document<'Game'>
  currentPlayer: Document<'Player'>
  otherPlayers: Document<'Player'>[]
  playerToProsets: Record<string, Document<'PlayingCard'>[][]>
}
const Game = (props: {
  gameInfo: GameInfo
  cards: Document<'PlayingCard'>[]
}) => {
  const { gameInfo, cards } = props
  const { game, currentPlayer } = gameInfo
  const [selectionTimeout, setSelectionTimeout] = useState<number | null>(null)

  const startSelectSet = useMutation('startSelectSet')
  const clearSelectSet = useMutation('maybeClearSelectSet')

  const addMessage = useMutation('sendMessage').withOptimisticUpdate(
    (localQueryStore, gameId, content, isPrivate) => {
      const messages =
        localQueryStore.getQuery('getRecentMessages', [gameId]) ?? []
      const newMessage = {
        _id: new Id('Message', crypto.randomUUID()),
        _creationTime: Date.now(),
        game: gameId,
        content,
        player: isPrivate ? currentPlayer._id : null,
      }
      localQueryStore.setQuery(
        'getRecentMessages',
        [gameId],
        [...messages, newMessage]
      )
    }
  )
  const sendMessage = (content: string, isPrivate = true) => {
    addMessage(game._id, content, isPrivate)
  }

  const revealProset = useMutation('revealProset')
  const discardRevealedProset = useMutation('discardRevealedProset')

  setInterval(() => {
    if (game.selectingPlayer !== null) {
      clearSelectSet(game._id)
    }
  }, 10 * 1000)

  const handleStartSelectSet = async () => {
    const selectResponse = await startSelectSet(game._id)
    if (selectResponse !== null) {
      sendMessage(selectResponse.reason)
      return
    }
    const timeout = window.setTimeout(() => {
      sendMessage('Took too long!')
      clearSelectSet(game._id)
    }, 20 * 1000)
    setSelectionTimeout(timeout)
  }

  const selectSetButton =
    game.selectingPlayer === null ? (
      <button onClick={handleStartSelectSet}>I found a Proset!</button>
    ) : (
      <Timer totalSeconds={20}></Timer>
    )

  const handleRevealProset = async () => {
    sendMessage(`Player ${currentPlayer.name} is revealing a set`, false)
    const revealedProset = await revealProset(game._id)
    setTimeout(() => {
      discardRevealedProset(game._id, revealedProset)
    }, 5 * 1000)
  }

  const onProsetFound = () => {
    sendMessage('You found a Proset!')
    sendMessage(`Player ${currentPlayer.name} found a Proset!`, false)
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }
  }

  return (
    <React.Fragment>
      <div style={{ textAlign: 'center' }}>
        <h1>Proset</h1>
        <div>Game {game.name}</div>
        <div>
          Player {currentPlayer.name}, Score {currentPlayer.score}
        </div>
        <div>
          Other Players:
          <ul>
            {gameInfo.otherPlayers.map((otherPlayer) => {
              return (
                <li>
                  <PlayerInfo
                    player={otherPlayer}
                    prosets={
                      gameInfo.playerToProsets[`id_${otherPlayer._id.id}`]
                    }
                  ></PlayerInfo>
                </li>
              )
            })}
          </ul>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
        >
          {selectSetButton}
          <button
            onClick={handleRevealProset}
            disabled={game.selectingPlayer !== null}
          >
            Reveal Proset
          </button>
        </div>
      </div>
      <CardContainer
        game={game}
        player={currentPlayer}
        cards={cards}
        onProsetFound={onProsetFound}
      ></CardContainer>
    </React.Fragment>
  )
}

const PlayerInfo = (props: {
  player: Document<'Player'>
  prosets: Document<'PlayingCard'>[][]
}) => {
  const [showProsets, setShowProsets] = useState(false)
  const { player, prosets } = props
  const prosetViews = prosets.map((cards) => {
    return <Proset key={cards[0]._id.id} cards={cards}></Proset>
  })

  return (
    <div
      style={{ display: 'flex', flexDirection: 'row' }}
      onClick={() => {
        setShowProsets(!showProsets)
      }}
    >
      <span>
        {player.name}, Score {player.score}
      </span>
      {showProsets ? <div>{prosetViews}</div> : null}
    </div>
  )
}

const Proset = (props: { cards: Document<'PlayingCard'>[] }) => {
  return (
    <div style={{ display: 'flex' }}>
      {props.cards.map((card) => {
        return <Card card={card} size="mini" selectionState="unselected"></Card>
      })}
    </div>
  )
}

export default Game
