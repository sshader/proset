import { getSystemPlayer } from './getPlayer'
import { Doc, Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(
  async ({ db, scheduler }, { gameId }: { gameId: Id<'Game'> }) => {
    const player = await getSystemPlayer(db, gameId)

    await db.patch(gameId, {
      selectingPlayer: player._id,
      selectionStartTime: Date.now(),
    })

    const cards = await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndRank', (q) =>
        q.eq('game', gameId).eq('proset', null)
      )
      .take(7)
    const prosetCards = findProset(cards)
    await Promise.all(
      prosetCards!.map(async (card) => {
        return await db.patch(card._id, {
          selectedBy: player._id,
        })
      })
    )
    await scheduler.runAfter(20 * 1000, 'maybeClearSelectSet', { gameId })
    return prosetCards!.map((card) => card._id)
  }
)

function findProset(cards: Array<Doc<'PlayingCard'>>) {
  for (let i = 1; i <= 128; i += 1) {
    const selection = []
    for (let cardIndex = 0; cardIndex < cards.length; cardIndex += 1) {
      if ((i >> cardIndex) % 2 === 1) {
        selection.push(cards[cardIndex])
      }
    }
    if (isProset(selection)) {
      return selection
    }
  }
}

function isProset(cards: Array<Doc<'PlayingCard'>>) {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const
  return colors.every((color) => {
    return cards.reduce((isEven: boolean, currentCard: Doc<'PlayingCard'>) => {
      if (currentCard[color]) {
        isEven = !isEven
      }
      return isEven
    }, true)
  })
}
