import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LeaderboardIcon from '@mui/icons-material/Leaderboard'
import { Drawer, useMediaQuery } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { api } from '../convex/_generated/api'
import { useGameInfo } from '../hooks/GameInfoProvider'
import { useSessionMutation } from '../hooks/SessionProvider'
import GameDetails from './GameDetails'
import MessageViewer from './MessageViewer'

const SIDEBAR_WIDTH = 256

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
    <div
      // On desktop, reserve space for the open drawer so it doesn't cover the cards
      className="shrink-0 transition-all"
      style={{ width: !isMobile && !collapsed ? SIDEBAR_WIDTH : undefined }}
    >
      {!isMobile && collapsed && (
        <div className="p-2">
          <button
            onClick={() => setCollapsed(false)}
            className="btn btn-circle btn-sm btn-primary"
          >
            <ChevronRightIcon />
          </button>
        </div>
      )}
      {isMobile && collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="btn btn-sm btn-primary fixed top-3 left-3 z-50"
        >
          <LeaderboardIcon fontSize="small" />
          Score: {gameInfo.currentPlayer.score}
        </button>
      )}
      <Drawer
        anchor={isMobile ? 'bottom' : 'left'}
        open={!collapsed}
        onClose={() => setCollapsed(true)}
        variant={isMobile ? 'temporary' : 'persistent'}
        PaperProps={{
          style: {
            border: 'none',
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <div
          className={`bg-base-200 text-base-content ${
            isMobile
              ? 'w-full rounded-t-2xl max-h-[70vh] overflow-y-auto'
              : 'h-full overflow-y-auto'
          } flex flex-col justify-between p-3 gap-3`}
          style={{ width: isMobile ? undefined : SIDEBAR_WIDTH }}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <button
                className="btn btn-ghost btn-sm text-lg font-bold normal-case"
                onClick={() => router.push('/all')}
              >
                Proset
              </button>
              <button
                onClick={() => setCollapsed(true)}
                className="btn btn-circle btn-sm btn-ghost"
              >
                {isMobile ? <ExpandMoreIcon /> : <ChevronLeftIcon />}
              </button>
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
          ) : null}
        </div>
      </Drawer>
      <MessageViewer></MessageViewer>
    </div>
  )
}
