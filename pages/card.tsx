import React, { FormEvent, useEffect, useState } from 'react'
import { Document, Id } from '../convex/_generated/dataModel'
import {
  useMutation,
  usePaginatedQuery,
  useQuery,
} from '../convex/_generated/react'
import Timer from './timer'

const Card = (props: {
  card: Document<'PlayingCard'>
  selectionState: 'selected' | 'unselected' | 'taken'
  onClick: (card: Document<'PlayingCard'>) => void
}) => {
  const { card } = props
  return (
    <div
      className={`Card Card--${props.selectionState}`}
      onClick={() => props.onClick(card)}
    >
      <div className="Card-row">
        <div
          className="Card-dot"
          style={{
            backgroundColor: card.red ? 'red' : 'inherit',
          }}
        ></div>
        <div
          className="Card-dot"
          style={{
            backgroundColor: card.orange ? 'orange' : 'inherit',
          }}
        ></div>
      </div>
      <div className="Card-row">
        <div
          className="Card-dot"
          style={{
            backgroundColor: card.yellow ? '#f5e653' : 'inherit',
          }}
        ></div>
        <div
          className="Card-dot"
          style={{
            backgroundColor: card.green ? 'green' : 'inherit',
          }}
        ></div>
      </div>
      <div className="Card-row">
        <div
          className="Card-dot"
          style={{
            backgroundColor: card.blue ? 'blue' : 'inherit',
          }}
        ></div>
        <div
          className="Card-dot"
          style={{
            backgroundColor: card.purple ? 'purple' : 'inherit',
          }}
        ></div>
      </div>
    </div>
  )
}
export default Card
