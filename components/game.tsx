import React, { useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'
import { GameInfo } from '../types/game_info'
import Card from './card'
import CardContainer from './card_container'
import { PlayerInfo } from './PlayerInfo'
import Timer from './timer'

function GameInfo({ gameInfo }: { gameInfo: GameInfo }) {
  const otherPlayers =
    gameInfo.otherPlayers.length === 0 ? (
      <div style={{ margin: 10 }}>Other Players: None</div>
    ) : (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div style={{ margin: 10, display: 'flex', alignItems: 'start' }}>
          Other Players:
        </div>
        {gameInfo.otherPlayers.map((otherPlayer) => {
          return (
            <PlayerInfo
              player={otherPlayer}
              prosets={gameInfo.playerToProsets[`id_${otherPlayer._id.id}`]}
            ></PlayerInfo>
          )
        })}
      </div>
    )

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <div style={{ margin: 10 }}>Proset</div>
        <div style={{ margin: 10 }}>Game {gameInfo.game.name}</div>
        <div style={{ margin: 10, display: 'flex' }}>You:&nbsp;</div>
        <PlayerInfo
          player={gameInfo.currentPlayer}
          prosets={
            gameInfo.playerToProsets[`id_${gameInfo.currentPlayer._id.id}`]
          }
        />
      </div>
      {otherPlayers}
    </div>
  )
}

const Game = (props: {
  gameInfo: GameInfo
  cards: Array<Document<'PlayingCard'>>
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
  const sendMessage = async (content: string, isPrivate = true) => {
    await addMessage(game._id, content, isPrivate)
  }

  const revealProset = useMutation('revealProset')
  const discardRevealedProset = useMutation('discardRevealedProset')

  setInterval(async () => {
    if (game.selectingPlayer !== null) {
      await clearSelectSet(game._id)
    }
  }, 10 * 1000)

  const handleStartSelectSet = async () => {
    const selectResponse = await startSelectSet(game._id)
    if (selectResponse !== null) {
      await sendMessage(selectResponse.reason)
      return
    }
    const timeout = window.setTimeout(async () => {
      await sendMessage('🐌 Too slow! Deducting a point.')
      await clearSelectSet(game._id)
    }, 20 * 1000)
    setSelectionTimeout(timeout)
  }

  const selectSetButton = game.selectingPlayer?.equals(currentPlayer._id) ? (
    <Timer totalSeconds={20}></Timer>
  ) : (
    <button
      onClick={handleStartSelectSet}
      disabled={game.selectingPlayer !== null}
    >
      I found a Proset!
    </button>
  )

  const handleRevealProset = async () => {
    await sendMessage(
      `👀 Player ${currentPlayer.name} is revealing a set`,
      false
    )
    const revealedProset = await revealProset(game._id)
    setTimeout(async () => {
      await discardRevealedProset(game._id, revealedProset)
    }, 5 * 1000)
  }

  const onProsetFound = async () => {
    await sendMessage('🎉 You found a Proset!')
    await sendMessage(`Player ${currentPlayer.name} found a Proset!`, false)
    if (selectionTimeout) {
      clearTimeout(selectionTimeout)
    }
  }

  return (
    <React.Fragment>
      <GameInfo gameInfo={gameInfo}></GameInfo>
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

      <CardContainer
        gameInfo={gameInfo}
        cards={cards}
        onProsetFound={onProsetFound}
      ></CardContainer>
    </React.Fragment>
  )
}

export const Proset = ({
  cards,
}: {
  cards: Array<Document<'PlayingCard'>>
}) => {
  return (
    <div style={{ display: 'flex' }}>
      {cards.map((card) => {
        return <Card card={card} size="mini"></Card>
      })}
    </div>
  )
}

export default Game
