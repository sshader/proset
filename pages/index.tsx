import { useMutation } from 'convex/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { api } from '../convex/_generated/api'

export default function App() {
  const startGame = useMutation(api.api.games.getOrCreate)

  const router = useRouter()

  useEffect(() => {
    const handleStartGame = async () => {
      const gameId = await startGame()
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
