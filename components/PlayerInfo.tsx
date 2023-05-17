import { useState } from 'react'
import { Doc } from '../convex/_generated/dataModel'
import { Proset } from './Game'

export const PlayerInfo = ({
  isCurrentPlayer,
  player,
  prosets,
  initialShowProsets = false,
}: {
  isCurrentPlayer: boolean
  player: Doc<'Player'>
  prosets: Array<Array<Doc<'PlayingCard'>>>
  initialShowProsets?: boolean
}) => {
  const [showProsets, setShowProsets] = useState(initialShowProsets)
  const prosetViews =
    prosets.length == 0 ? (
      <div>No prosets yet!</div>
    ) : (
      prosets.map((cards) => {
        return <Proset key={cards[0]._id} cards={cards}></Proset>
      })
    )

  return (
    <div
      className={`PlayerInfo ${isCurrentPlayer ? 'PlayerInfo--current' : ''}`}
    >
      <span
        className={`PlayerInfo-section Fill--${player.color} Border--${player.color}`}
        onClick={() => {
          setShowProsets(!showProsets)
        }}
      >
        {isCurrentPlayer ? '(You)' : ''} {player.name}, Score {player.score}
      </span>
      {showProsets ? (
        <div
          className={`PlayerInfo-section PlayerInfo-prosets Border--${player.color}`}
        >
          {prosetViews}
        </div>
      ) : null}
    </div>
  )
}
