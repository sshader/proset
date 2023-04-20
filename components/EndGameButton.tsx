import { useRouter } from 'next/router'
import { Id } from '../convex/_generated/dataModel'
import { useMutation } from '../convex/_generated/react'

export default function EndGameButton({ gameId }: { gameId: Id<'Game'> }) {
  const endGame = useMutation('endGame')
  const router = useRouter()

  return (
    <div
      style={{
        justifyContent: 'center',
        display: 'flex',
      }}
    >
      <button
        onClick={async () => {
          await endGame({ gameId })
          await router.push('/')
        }}
      >
        End Game
      </button>
    </div>
  )
}
