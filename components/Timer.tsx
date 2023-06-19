import { useEffect, useState } from 'react'

const Timer = ({
  totalSeconds,
  pause,
}: {
  totalSeconds: number
  pause?: boolean
}) => {
  console.log('####', pause)
  const [seconds, setSeconds] = useState(totalSeconds)
  useEffect(() => {
    if (!pause) {
      const interval = setInterval(() => {
        if (!pause) {
          setSeconds((seconds) => seconds - 1)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  return (
    <button style={{ backgroundColor: 'grey' }}>
      ⏰ {seconds < 10 ? `:0${seconds}` : `:${seconds}`}
    </button>
  )
}

export default Timer
