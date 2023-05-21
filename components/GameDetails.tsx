import { useSendMessage } from '../optimistic_updates/add_message'
import { GameInfo } from '../types/game_info'
import CopyLinkButton from './CopyLinkButton'
import EndGameButton from './EndGameButton'
import { PlayerInfo } from './PlayerInfo'

export default function GameDetails({
  gameInfo,
  showProsets = false,
}: {
  gameInfo: GameInfo
  showProsets?: boolean
}) {
  console.log(gameInfo)
  const otherPlayers =
    gameInfo.game.allPlayers.length === 1 ? (
      ''
    ) : (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {gameInfo.game.allPlayers.map((otherPlayer) => {
          return (
            <PlayerInfo
              isCurrentPlayer={false}
              player={otherPlayer}
              prosets={otherPlayer.prosets}
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
        player={gameInfo.game.currentPlayer}
        prosets={gameInfo.game.currentPlayer.prosets}
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
              gameId: gameInfo.game._id,
              content: 'Copied link to clipboard!',
              isPrivate: true,
            })
          }
        />
        <EndGameButton gameId={gameInfo.game._id} />
      </div>
    </div>
  )
}
