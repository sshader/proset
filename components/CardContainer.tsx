import { Doc } from '../convex/_generated/dataModel'
import { useGameInfo } from '../hooks/GameInfoProvider'
import Card from './Card'
import PlayingCard from './playing_card'

const CardContainer = ({
  cards,
  onCardClicked,
}: {
  cards: Array<Doc<'PlayingCards'>>
  onCardClicked: (card: Doc<'PlayingCards'> | null) => void
}) => {
  const gameInfo = useGameInfo()
  const selectingPlayerId = gameInfo.game.selectingPlayer

  const gameSelectionState =
    selectingPlayerId === null
      ? 'available'
      : selectingPlayerId === gameInfo.currentPlayer._id
      ? 'selecting'
      : 'waiting'

  const selectionColor =
    selectingPlayerId === null
      ? null
      : selectingPlayerId === gameInfo.currentPlayer._id
      ? gameInfo.currentPlayer.color
      : gameInfo.otherPlayers.find((p) => p._id === selectingPlayerId)?.color ??
        'grey'

  let tooltipText = ''
  switch (gameSelectionState) {
    case 'available':
      tooltipText = 'Hit "I found a Proset!" to start selection'
      break
    case 'waiting':
      tooltipText = 'Waiting for another player to select'
      break
  }

  const cardComponents = []
  for (let i = 0; i < 7; i += 1) {
    const card = cards[i]
    if (card !== undefined) {
      cardComponents.push(
        <div key={card._id.toString()}>
          <PlayingCard
            selectionColor={card.selectedBy != null ? selectionColor : null}
            card={card}
            size="regular"
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onClick={
              gameSelectionState === 'selecting'
                ? onCardClicked
                : () => {
                    // noop
                  }
            }
          />
        </div>
      )
    } else {
      cardComponents.push(
        <div key={i} style={{ opacity: 0 }}>
          <Card
            card={{
              red: false,
              orange: false,
              yellow: false,
              green: false,
              blue: false,
              purple: false,
            }}
            size="regular"
          />
        </div>
      )
    }
  }

  return (
    <div
      title={tooltipText}
      className={`CardContainer CardContainer--${gameSelectionState}`}
    >
      {...cardComponents}
    </div>
  )
}
export default CardContainer
