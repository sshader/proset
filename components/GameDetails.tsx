import { useGameInfo } from '../hooks/GameInfoProvider'
import { useSendMessage } from '../optimistic_updates/add_message'
import CopyLinkButton from './CopyLinkButton'
import EndGameButton from './EndGameButton'
import { PlayerInfo } from './PlayerInfo'

export default function GameDetails({
  showProsets = false,
}: {
  showProsets?: boolean
}) {
  const gameInfo = useGameInfo()
  const otherPlayers =
    gameInfo.otherPlayers.length === 0 ? (
      ''
    ) : (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {gameInfo.otherPlayers.map((otherPlayer) => {
          return (
            <PlayerInfo
              isCurrentPlayer={false}
              player={otherPlayer}
              prosets={gameInfo.playerToProsets[otherPlayer._id] ?? []}
              initialShowProsets={showProsets}
            ></PlayerInfo>
          )
        })}
      </div>
    )

  const sendMessage = useSendMessage()

  return (
    <div className="GameDetails">
      <PlayerInfo
        isCurrentPlayer={true}
        player={gameInfo.currentPlayer}
        prosets={gameInfo.playerToProsets[gameInfo.currentPlayer._id] ?? []}
        initialShowProsets={showProsets}
      />
      {otherPlayers}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        <CopyLinkButton
          onCopy={() =>
            sendMessage({
              content: 'Copied link to clipboard!',
              isPrivate: true,
            })
          }
        />
        {gameInfo.currentPlayer.isGuest ? null : <EndGameButton />}
      </div>
    </div>
  )
}
