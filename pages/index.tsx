import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { api } from '../convex/_generated/api'
import { useSessionMutation } from '../hooks/SessionProvider'

export default function App() {
  const startGame = useSessionMutation(api.games.getOrCreate)

  const router = useRouter()

  useEffect(() => {
    const handleStartGame = async () => {
      if (typeof window === 'undefined') {
        return
      }
      const { gameId } = await startGame({})
      await router.push({
        pathname: '/game/[gameId]',
        query: {
          gameId: gameId,
        },
      })
    }
    handleStartGame().catch(console.error)
  })

  return <div>Navigating...</div>
}
