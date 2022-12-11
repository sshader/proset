import React, { useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'
import { GameInfo } from '../types/game_info'
import Card from './card'
import CardContainer from './card_container'
import { PlayerInfo } from './PlayerInfo'
import Timer from './timer'

function GameInfo(props: { gameInfo: GameInfo }) {
  const otherPlayers =
    props.gameInfo.otherPlayers.length === 0 ? (
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
        {props.gameInfo.otherPlayers.map((otherPlayer) => {
          return (
            <PlayerInfo
              player={otherPlayer}
              prosets={
                props.gameInfo.playerToProsets[`id_${otherPlayer._id.id}`]
              }
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
        <div style={{ margin: 10 }}>Game {props.gameInfo.game.name}</div>
        <div style={{ margin: 10, display: 'flex' }}>You:&nbsp;</div>
        <PlayerInfo
          player={props.gameInfo.currentPlayer}
          prosets={
            props.gameInfo.playerToProsets[
              `id_${props.gameInfo.currentPlayer._id.id}`
            ]
          }
        />
      </div>
      {otherPlayers}
    </div>
  )
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
      sendMessage('🐌 Too slow! Deducting a point.')
      clearSelectSet(game._id)
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
    sendMessage(`👀 Player ${currentPlayer.name} is revealing a set`, false)
    const revealedProset = await revealProset(game._id)
    setTimeout(() => {
      discardRevealedProset(game._id, revealedProset)
    }, 5 * 1000)
  }

  const onProsetFound = () => {
    sendMessage('🎉 You found a Proset!')
    sendMessage(`Player ${currentPlayer.name} found a Proset!`, false)
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

export const Proset = (props: { cards: Document<'PlayingCard'>[] }) => {
  return (
    <div style={{ display: 'flex' }}>
      {props.cards.map((card) => {
        return <Card card={card} size="mini"></Card>
      })}
    </div>
  )
}

export default Game
