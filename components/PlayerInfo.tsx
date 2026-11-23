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
  player: Doc<'Players'>
  prosets: Array<Array<Doc<'PlayingCards'>>>
  initialShowProsets?: boolean
}) => {
  const [showProsets, setShowProsets] = useState(initialShowProsets)
  const prosetViews =
    prosets.length == 0 ? (
      <div className="text-sm opacity-70">No prosets yet!</div>
    ) : (
      prosets.map((cards) => {
        return <Proset key={cards[0]._id} cards={cards}></Proset>
      })
    )

  return (
    <div
      className={`flex flex-col player-${player.color} ${
        isCurrentPlayer ? 'font-bold' : ''
      }`}
    >
      <button
        className="PlayerInfo-section PlayerInfo-header"
        onClick={() => {
          setShowProsets(!showProsets)
        }}
      >
        <span className="truncate">
          {player.name}
          {isCurrentPlayer ? ' (you)' : ''}
        </span>
        <span className="badge">{player.score}</span>
      </button>
      {showProsets ? (
        <div className="PlayerInfo-section PlayerInfo-prosets">
          {prosetViews}
        </div>
      ) : null}
    </div>
  )
}
