import React from 'react'
import { useEffect, useState } from 'react'
import { useQuery } from '../convex/_generated/react'

const GamePicker = (props: {}) => {
  const onGoingGames = useQuery('queries/getOngoingGames')
  if (onGoingGames === undefined) {
    return <div>Loading</div>
  }

  return (
    <React.Fragment>
      <h2>Watch an ongoing game</h2>
      <ul>
        {onGoingGames.map((game) => {
          return (
            <li key={game._id.id}>
              Name: {game.name} Players: {game.numPlayers}
            </li>
          )
        })}
      </ul>
    </React.Fragment>
  )
}

export default GamePicker
