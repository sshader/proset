import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Drawer } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { GameInfo } from '../types/game_info'
import GameDetails from './GameDetails'

export default function Sidebar({ gameInfo }: { gameInfo: GameInfo }) {
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
        <div className="bg-slate-200 w-64 rounded-r-lg h-full">
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 5,
              gap: 10,
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

          <GameDetails gameInfo={gameInfo} />
        </div>
      </Drawer>
      {/* <MessageViewer gameId={gameInfo.game._id}></MessageViewer> */}
    </div>
  )
}
