import confetti from 'canvas-confetti'
import React, { useCallback, useEffect, useState } from 'react'
import { api } from '../convex/_generated/api'
import { Doc } from '../convex/_generated/dataModel'
import { useGameInfo, useGameMutation } from '../hooks/GameInfoProvider'
import { useSessionMutation } from '../hooks/SessionProvider'
import { useSendMessage } from '../optimistic_updates/add_message'
import Card from './Card'
import CardContainer from './CardContainer'
import EndGameButton from './EndGameButton'
import Timer from './Timer'

const Game = (props: {
  cards: {
    results: Array<Doc<'PlayingCard'>>
    status: 'Exhausted' | 'CanLoadMore' | 'LoadingMore' | 'LoadingFirstPage'
  }
}) => {
  const gameInfo = useGameInfo()
  const { cards } = props
  const { game, currentPlayer } = gameInfo
  const gameId = game._id
  const [selectionTimeout, setSelectionTimeout] = useState<number | null>(null)

  const startSelectSet = useGameMutation(api.cards.startSelectSet)

  const selectCard = useGameMutation(api.cards.select)

  const sendMessage = useSendMessage()

  const revealProset = useSessionMutation(api.cards.reveal)

  const handleStartSelectSet = useCallback(async () => {
    if (game.selectingPlayer === currentPlayer._id) {
      return
    }
    const selectResponse = await startSelectSet({})
    if (selectResponse !== null) {
      await sendMessage({
        content: selectResponse.reason,
        isPrivate: true,
      })
      return
    }
    const timeout = window.setTimeout(async () => {
      await sendMessage({
        content: '🐌 Too slow! Deducting a point.',
        isPrivate: true,
      })
    }, 20 * 1000)
    setSelectionTimeout(timeout)
  }, [sendMessage, startSelectSet, setSelectionTimeout, selectionTimeout])

  const handleSelectCard = useCallback(
    async (card: Doc<'PlayingCard'> | null) => {
      if (card === null) {
        return
      }
      const selectionResult = await selectCard({
        cardId: card._id,
      })
      if (selectionResult === 'FoundProset') {
        if (selectionTimeout) {
          clearTimeout(selectionTimeout)
          setSelectionTimeout(null)
        }
        await confetti({})
      }
    },
    [selectCard, selectionTimeout]
  )
  const handleKeyDown = useCallback(
    async (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return // Do nothing if event already handled
      }
      // Ignore if following modifier is active.
      if (
        event.getModifierState('Control') ||
        event.getModifierState('Alt') ||
        event.getModifierState('Meta') ||
        event.getModifierState('Fn') ||
        event.getModifierState('Hyper') ||
        event.getModifierState('OS') ||
        event.getModifierState('Super') ||
        event.getModifierState('Win') /* hack for IE */
      ) {
        return
      }

      switch (event.code) {
        case 'Space':
          await handleStartSelectSet()
          break
        case 'KeyR':
          await revealProset({ gameId })
          break
        case 'Digit1':
          await handleSelectCard(cards.results[0] ?? null)
          break
        case 'Digit2':
          await handleSelectCard(cards.results[1] ?? null)
          break
        case 'Digit3':
          await handleSelectCard(cards.results[2] ?? null)
          break
        case 'Digit4':
          await handleSelectCard(cards.results[3] ?? null)
          break
        case 'Digit5':
          await handleSelectCard(cards.results[4] ?? null)
          break
        case 'Digit6':
          await handleSelectCard(cards.results[5] ?? null)
          break
        case 'Digit7':
          await handleSelectCard(cards.results[6] ?? null)
          break
        default:
          return
      }
    },
    [
      cards.results,
      gameId,
      handleSelectCard,
      handleStartSelectSet,
      revealProset,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  const selectSetButton =
    game.selectingPlayer === currentPlayer._id ? (
      selectionTimeout !== null ? (
        <Timer totalSeconds={20}></Timer>
      ) : (
        <button className="btn btn-primary" disabled>
          🥳
        </button>
      )
    ) : (
      <button
        className="btn btn-primary"
        onClick={handleStartSelectSet}
        disabled={game.selectingPlayer !== null}
      >
        I found a Proset!
      </button>
    )

  const handleRevealProset = async () => {
    await revealProset({ gameId })
  }

  return (
    <div className="flex grow shrink min-w-fit justify-center">
      <div className="flex flex-col gap-4 justify-center">
        {cards.results.length === 0 && cards.status === 'Exhausted' ? (
          <EndGameButton />
        ) : (
          <React.Fragment>
            <CardContainer
              cards={cards.results}
              onCardClicked={handleSelectCard}
            />
            <div className="flex shrink min-w-0 justify-center gap-2">
              {selectSetButton}
              <button
                className="btn btn-primary"
                onClick={handleRevealProset}
                disabled={game.selectingPlayer !== null}
              >
                Reveal Proset
              </button>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  )
}

export const Proset = ({ cards }: { cards: Array<Doc<'PlayingCard'>> }) => {
  return (
    <div className="flex gap-2 flex-shrink-0 flex-grow min-w-fit">
      {cards.map((card) => {
        return <Card card={card} size="mini"></Card>
      })}
    </div>
  )
}

export default Game
