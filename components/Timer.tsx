import { useEffect, useState } from 'react'

const Timer = ({ totalSeconds }: { totalSeconds: number }) => {
  const [seconds, setSeconds] = useState(totalSeconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((seconds) => seconds - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <button style={{ backgroundColor: 'grey' }}>
      ⏰ {seconds < 10 ? `:0${seconds}` : `:${seconds}`}
    </button>
  )
}

export default Timer
