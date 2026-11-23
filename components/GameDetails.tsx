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
      <div className="flex flex-col">
        {gameInfo.otherPlayers.map((otherPlayer) => {
          return (
            <PlayerInfo
              key={otherPlayer._id}
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
    <div className="w-full">
      <PlayerInfo
        isCurrentPlayer={true}
        player={gameInfo.currentPlayer}
        prosets={gameInfo.playerToProsets[gameInfo.currentPlayer._id] ?? []}
        initialShowProsets={showProsets}
      />
      {otherPlayers}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
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
