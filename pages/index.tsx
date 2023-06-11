import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useMutation } from '../convex/_generated/react'

export default function App() {
  const startGame = useMutation('api/games:getOrCreate')

  const router = useRouter()

  useEffect(() => {
    const handleStartGame = async () => {
      const gameId = await startGame()
      await router.push({
        pathname: '/game/[gameId]',
        query: {
          gameId: gameId.id,
        },
      })
    }
    handleStartGame().catch(console.error)
  })

  return <div>Navigating...</div>
}
