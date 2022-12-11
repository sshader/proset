import { Document } from '../convex/_generated/dataModel'
import Card from './card'

const PlayingCard = (props: {
  card: Document<'PlayingCard'>
  selectionColor: string | null
  size: 'regular' | 'mini'
  onClick: (card: Document<'PlayingCard'>) => void
}) => {
  const { card } = props
  console.log('selectionColor', props.selectionColor)
  return (
    <div onClick={() => props.onClick(card)}>
      <Card
        card={card}
        selectionColor={props.selectionColor}
        size={props.size}
      ></Card>
    </div>
  )
}
export default PlayingCard
