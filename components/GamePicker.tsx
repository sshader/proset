import { useQuery } from 'convex/react'
import Link from 'next/link'
import { api } from '../convex/_generated/api'

const renderLoading = () => {
  return (
    <ul>
      <li className="Placeholder Placeholder-row"></li>
      <li className="Placeholder Placeholder-row"></li>
    </ul>
  )
}
const GamePicker = () => {
  const onGoingGames = useQuery(api.queries.getOngoingGames.default)

  return (
    <div>
      <h1>Your ongoing games:</h1>
      {onGoingGames === undefined ? (
        renderLoading()
      ) : (
        <ul>
          {onGoingGames.map((game: any) => {
            return (
              <li
                style={{ display: 'flex', justifyContent: 'space-between' }}
                key={game._id.id}
              >
                <div>
                  <p>Players: {game.playerNames.join(', ')}</p>
                </div>
                <Link
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  href={`/game/${game._id}`}
                >
                  <button className="btn btn-primary">Join</button>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default GamePicker
