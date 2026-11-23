import Link from 'next/link'
import { api } from '../convex/_generated/api'
import { useSessionQuery } from '../hooks/SessionProvider'

const renderLoading = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="Placeholder Placeholder-row bg-base-300"></div>
      <div className="Placeholder Placeholder-row bg-base-300"></div>
    </div>
  )
}
const GamePicker = () => {
  const onGoingGames = useSessionQuery(api.queries.getOngoingGames.default)

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-2">Ongoing games</h2>
      {onGoingGames === undefined ? (
        renderLoading()
      ) : (
        <ul className="rounded-box border border-base-300 divide-y divide-base-300">
          {onGoingGames.length === 0 ? (
            <li className="p-4 opacity-70">No games in progress</li>
          ) : null}
          {onGoingGames.map((game: any) => {
            return (
              <li
                className="flex items-center justify-between p-3 pl-4"
                key={game._id}
              >
                <span>
                  {game.numPlayers}{' '}
                  {game.numPlayers === 1 ? 'player' : 'players'}
                </span>
                <Link
                  href={`/game/${game._id}`}
                  className="btn btn-primary btn-sm"
                >
                  Join
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
