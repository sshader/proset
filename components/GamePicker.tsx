import Link from 'next/link'
import React from 'react'
import { useQuery } from '../convex/_generated/react'

const renderLoading = () => {
  return (
    <ul>
      <li className="Placeholder Placeholder-row"></li>
      <li className="Placeholder Placeholder-row"></li>
    </ul>
  )
}
const GamePicker = () => {
  const onGoingGames = useQuery('queries/getOngoingGames')

  return (
    <React.Fragment>
      <h1>Your ongoing games:</h1>
      {onGoingGames === undefined
        ? (
            renderLoading()
          )
        : (
        <ul>
          {onGoingGames.map((game) => {
            return (
              <li
                style={{ display: 'flex', justifyContent: 'space-between' }}
                key={game._id.id}
              >
                <div>
                  <p style={{ fontWeight: 'bold' }}>{game.name}</p>
                  <p>Players: {game.numPlayers}</p>
                </div>
                <Link
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  href={`/game/${game._id.id}`}
                >
                  <button>Join</button>
                </Link>
              </li>
            )
          })}
        </ul>
          )}
    </React.Fragment>
  )
}

export default GamePicker
