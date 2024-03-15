import { Doc } from '../convex/_generated/dataModel'
import Card from './Card'

const PlayingCard = ({
  card,
  selectionColor,
  size,
  onClick,
}: {
  card: Doc<'PlayingCards'>
  selectionColor: string | null
  size: 'regular' | 'mini'
  onClick: (card: Doc<'PlayingCards'>) => void
}) => {
  return (
    <button
      className="rounded-box focus-visible:border-10 focus-visible:outline-slate-500 focus-visible:outline-offset-4"
      onClick={() => onClick(card)}
      role="tab"
    >
      <Card card={card} selectionColor={selectionColor} size={size}></Card>
    </button>
  )
}
export default PlayingCard
