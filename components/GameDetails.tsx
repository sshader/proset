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
  const otherPlayers =
    gameInfo.otherPlayers.length === 0 ? (
      ''
    ) : (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {gameInfo.otherPlayers.map((otherPlayer) => {
          return (
            <PlayerInfo
              isCurrentPlayer={false}
              player={otherPlayer}
              prosets={gameInfo.playerToProsets.get(otherPlayer._id.id) ?? [[]]}
              initialShowProsets={showProsets}
            ></PlayerInfo>
          )
        })}
      </div>
    )

  const sendMessage = useSendMessage()

  return (
    <div className="GameDetails">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div>Proset</div>
        <div>Game {gameInfo.game.name}</div>
      </div>
      <PlayerInfo
        isCurrentPlayer={true}
        player={gameInfo.currentPlayer}
        prosets={
          gameInfo.playerToProsets.get(gameInfo.currentPlayer._id.id) ?? [[]]
        }
        initialShowProsets={showProsets}
      />
      {otherPlayers}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
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
