import { Document } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'
import { GameInfo } from '../types/game_info'
import PlayingCard from './playing_card'

const CardContainer = ({
  gameInfo,
  cards,
  onProsetFound,
}: {
  gameInfo: GameInfo
  cards: Array<Document<'PlayingCard'>>
  onProsetFound: () => void
}) => {
  const selectCard = useMutation('selectCard')
  const unselectCard = useMutation('unselectCard')

  const selectingPlayerId = gameInfo.game.selectingPlayer

  const gameSelectionState =
    selectingPlayerId === null
      ? 'available'
      : selectingPlayerId.equals(gameInfo.currentPlayer._id)
      ? 'selecting'
      : 'waiting'

  const selectionColor =
    selectingPlayerId === null
      ? null
      : selectingPlayerId.equals(gameInfo.currentPlayer._id)
      ? gameInfo.currentPlayer.color
      : gameInfo.otherPlayers.find((p) => p._id.equals(selectingPlayerId))
          ?.color ?? 'grey'
  console.log(selectionColor, selectingPlayerId)

  const onClick = async (card: Document<'PlayingCard'>) => {
    if (card.selectedBy === null) {
      const selectionResult = await selectCard(card._id)
      if (selectionResult === 'FoundProset') {
        onProsetFound()
      }
    } else {
      await unselectCard(card._id)
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
        return (
          <div key={card._id.toString()}>
            <PlayingCard
              selectionColor={card.selectedBy != null ? selectionColor : null}
              card={card}
              size="regular"
              // eslint-disable-next-line @typescript-eslint/no-empty-function
              onClick={gameSelectionState === 'selecting' ? onClick : () => {}}
            />
          </div>
        )
      })}
    </div>
  )
}
export default CardContainer
