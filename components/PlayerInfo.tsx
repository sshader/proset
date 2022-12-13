import { useState } from 'react'
import { Document } from '../convex/_generated/dataModel'
import { Proset } from './game'

export const PlayerInfo = (props: {
  player: Document<'Player'>
  prosets: Array<Array<Document<'PlayingCard'>>>
}) => {
  const [showProsets, setShowProsets] = useState(false)
  const { player, prosets } = props
  const prosetViews =
    prosets.length == 0
      ? (
      <div>No prosets yet!</div>
        )
      : (
          prosets.map((cards) => {
            return <Proset key={cards[0]._id.id} cards={cards}></Proset>
          })
        )

  return (
    <div className={'PlayerInfo'}>
      <span
        className={`PlayerInfo-section Fill--${player.color} Border--${player.color}`}
        onClick={() => {
          setShowProsets(!showProsets)
        }}
      >
        {player.name}, Score {player.score}
      </span>
      {showProsets
        ? (
        <div
          className={`PlayerInfo-section PlayerInfo-prosets Border--${player.color}`}
        >
          {prosetViews}
        </div>
          )
        : null}
    </div>
  )
}
