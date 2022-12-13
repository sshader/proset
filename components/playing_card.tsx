import { Document } from '../convex/_generated/dataModel'
import Card from './card'

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
  console.log('selectionColor', selectionColor)
  return (
    <div onClick={() => onClick(card)}>
      <Card card={card} selectionColor={selectionColor} size={size}></Card>
    </div>
  )
}
export default PlayingCard
