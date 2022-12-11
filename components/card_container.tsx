import React from 'react'
import { Document } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'
import PlayingCard from './playing_card'

const CardContainer = (props: {
  game: Document<'Game'>
  player: Document<'Player'>
  cards: Document<'PlayingCard'>[]
  onProsetFound: () => void
}) => {
  const { game, player, cards } = props

  const selectCard = useMutation('selectCard')
  const unselectCard = useMutation('unselectCard')

  const gameSelectionState =
    game.selectingPlayer === null
      ? 'available'
      : game.selectingPlayer.equals(player._id)
      ? 'selecting'
      : 'waiting'

  const onClick = async (card: Document<'PlayingCard'>) => {
    if (card.selectedBy === null) {
      const selectionResult = await selectCard(card._id)
      if (selectionResult === 'FoundProset') {
        props.onProsetFound()
      }
    } else if (card.selectedBy.equals(props.player._id)) {
      unselectCard(card._id)
    }
  }

  let tooltipText = ''
  switch (gameSelectionState) {
    case 'available':
      tooltipText = 'Hit "I found a Proset!" to start selection'
      break
    case 'waiting':
      tooltipText = 'Waiting for another player to select'
      break
  }

  return (
    <div
      title={tooltipText}
      className={`CardContainer CardContainer--${gameSelectionState}`}
    >
      {cards.map((card) => {
        const selectionState =
          card.selectedBy === null
            ? 'unselected'
            : card.selectedBy.equals(player._id)
            ? 'selected'
            : 'taken'
        return (
          <div key={card._id.toString()}>
            <PlayingCard
              selectionState={selectionState}
              card={card}
              size="regular"
              onClick={gameSelectionState === 'selecting' ? onClick : () => {}}
            />
          </div>
        )
      })}
    </div>
  )
}
export default CardContainer
