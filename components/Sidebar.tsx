import { useState } from 'react'
import { GameInfo } from '../types/game_info'
import GameDetails from './GameDetails'
import MessageViewer from './MessageViewer'

export default function Sidebar({ gameInfo }: { gameInfo: GameInfo }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="Sidebar">
      <div
        className="Sidebar-content"
        style={{
          padding: 10,
          display: collapsed ? 'none' : 'flex',
          alignItems: 'space-between',
          flexDirection: 'column',
        }}
      >
        <GameDetails gameInfo={gameInfo} />
        <MessageViewer gameId={gameInfo.game._id}></MessageViewer>
      </div>
      <div
        style={{
          marginTop: 'auto',
          marginBottom: 'auto',
        }}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? '>>' : '<<'}
      </div>
    </div>
  )
}
