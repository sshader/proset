import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Drawer, Fab } from '@mui/material'
import { useState } from 'react'
import { GameInfo } from '../types/game_info'
import GameDetails from './GameDetails'
import MessageViewer from './MessageViewer'

export default function Sidebar({ gameInfo }: { gameInfo: GameInfo }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div>
      <div style={{ padding: 5 }}>
        <Fab
          size="small"
          color="primary"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
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
            <div>Proset</div>
            <div style={{ padding: 5 }}>
              <Fab
                size="small"
                color="primary"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </Fab>
            </div>
          </div>

          <GameDetails gameInfo={gameInfo} />
          <MessageViewer gameId={gameInfo.game._id}></MessageViewer>
        </div>
      </Drawer>
    </div>
  )
}
