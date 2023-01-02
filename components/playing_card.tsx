import { Document } from '../convex/_generated/dataModel'
import Card from './Card'

const PlayingCard = ({
  card,
  selectionColor,
  size,
  onClick,
}: {
  card: Document<'PlayingCard'>
  selectionColor: string | null
  size: 'regular' | 'mini'
  onClick: (card: Document<'PlayingCard'>) => void
}) => {
  return (
    <div onClick={() => onClick(card)}>
      <Card card={card} selectionColor={selectionColor} size={size}></Card>
    </div>
  )
}
export default PlayingCard
