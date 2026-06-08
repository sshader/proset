import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Drawer, useMediaQuery } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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
  const isMobile = useMediaQuery('(max-width: 640px)')

  useEffect(() => {
    if (isMobile) setCollapsed(true)
  }, [isMobile])

  return (
    <div>
      {!isMobile && (
        <div style={{ padding: 5 }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn btn-circle btn-sm btn-primary"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </button>
        </div>
      )}
      {isMobile && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="btn btn-circle btn-sm btn-primary fixed bottom-4 left-4 z-50"
        >
          <ExpandLessIcon />
        </button>
      )}
      <Drawer
        anchor={isMobile ? 'bottom' : 'left'}
        open={!collapsed}
        onClose={() => setCollapsed(true)}
        variant={isMobile ? 'temporary' : 'persistent'}
        PaperProps={{
          style: { border: 'none' },
        }}
      >
        <div
          className={`bg-slate-200 ${
            isMobile
              ? 'w-full rounded-t-lg max-h-64 overflow-y-auto'
              : 'w-64 rounded-r-lg h-full'
          } flex flex-col justify-between p-1 gap-2`}
        >
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
                  onClick={() => setCollapsed(true)}
                  className="btn btn-circle btn-sm btn-primary"
                >
                  {isMobile ? <ExpandMoreIcon /> : <ChevronLeftIcon />}
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
