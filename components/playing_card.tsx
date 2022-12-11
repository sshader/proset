import React, { FormEvent, useEffect, useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../convex/_generated/react'
import Card from './card'
import Timer from './timer'

const PlayingCard = (props: {
  card: Document<'PlayingCard'>
  selectionState: 'selected' | 'unselected' | 'taken'
  size: 'regular' | 'mini'
  onClick: (card: Document<'PlayingCard'>) => void
}) => {
  const { card } = props
  return (
    <div onClick={() => props.onClick(card)}>
      <Card
        card={card}
        selectionState={props.selectionState}
        size={props.size}
      ></Card>
    </div>
  )
}
export default PlayingCard
