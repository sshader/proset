import Link from 'next/link'
import React from 'react'
import { useQuery } from '../convex/_generated/react'

const GamePicker = (props: {}) => {
  const onGoingGames = useQuery('queries/getOngoingGames')
  if (onGoingGames === undefined) {
    return <div>Loading</div>
  }

  return (
    <React.Fragment>
      <h1 style={{}}>Your games:</h1>
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
    </React.Fragment>
  )
}

export default GamePicker
