import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Drawer } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { api } from '../convex/_generated/api'
import { useGameInfo } from '../hooks/GameInfoProvider'
import { useSessionMutation } from '../hooks/SessionProvider'
import GameDetails from './GameDetails'
import MessageViewer from './MessageViewer'

export default function Sidebar() {
  const gameInfo = useGameInfo()
  const completeOnboarding = useSessionMutation(api.users.completeOnboarding)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  return (
    <div>
      <div style={{ padding: 5 }}>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="btn btn-circle btn-sm btn-primary"
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>
      <Drawer
        anchor={'left'}
        open={!collapsed}
        onClose={() => setCollapsed(true)}
        variant="persistent"
        PaperProps={{
          style: { border: 'none' },
        }}
      >
        <div className="bg-base-300 w-64 rounded-r-lg h-full flex flex-col justify-between p-3 gap-2">
          <div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                className="btn btn-primary btn-sm"
                onClick={() => router.push('/all')}
              >
                Proset
              </button>
              <div style={{ padding: 5 }}>
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="btn btn-circle btn-sm btn-primary"
                >
                  {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </button>
              </div>
            </div>

            <GameDetails />
          </div>
          {gameInfo.currentPlayer.showOnboarding ? (
            <button
              className="btn btn-info relative"
              onClick={async () => {
                await completeOnboarding({})
                await router.push('/all')
              }}
            >
              <span className="absolute top-0 right-0 -mr-1 -mt-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
              </span>
              How to play
            </button>
          ) : (
            ''
          )}
        </div>
      </Drawer>
      <MessageViewer></MessageViewer>
    </div>
  )
}
