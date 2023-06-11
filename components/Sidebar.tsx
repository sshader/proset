import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Drawer, Fab } from '@mui/material'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { GameInfo } from '../types/game_info'
import GameDetails from './GameDetails'
import MessageViewer from './MessageViewer'

export default function Sidebar({ gameInfo }: { gameInfo: GameInfo }) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  return (
    <div>
      <div style={{ padding: 5 }}>
        <Fab
          size="small"
          color="primary"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </Fab>
      </div>
      <Drawer
        anchor={'left'}
        open={!collapsed}
        onClose={() => setCollapsed(true)}
        variant="persistent"
        PaperProps={{
          style: {
            borderRight: '1px solid black',
          },
        }}
      >
        <div className="Sidebar-content">
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
            <button onClick={() => router.push('/all')}>Proset</button>
            <div style={{ padding: 5 }}>
              <Fab
                size="small"
                color="primary"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </Fab>
            </div>
          </div>

          <GameDetails gameInfo={gameInfo} />
        </div>
      </Drawer>
      <MessageViewer gameId={gameInfo.game._id}></MessageViewer>
    </div>
  )
}
