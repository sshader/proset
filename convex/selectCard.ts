import { getPlayer } from './getPlayer'
import { clearSelectSet } from './maybeClearSelectSet'
import { Document, Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(async ({ db, auth }, cardId: Id<'PlayingCard'>) => {
  const card = (await db.get(cardId))!
  if (card.selectedBy !== null) {
    return { reason: 'AlreadySelected', selectedBy: card.selectedBy }
  }
  const player = await getPlayer(db, auth, card.game)
  db.patch(card._id, {
    selectedBy: player._id,
  })

  const currentlySelected = await db
    .query('PlayingCard')
    .withIndex('ByGameAndProsetAndSelectedBy', (q) => {
      return q
        .eq('game', card.game)
        .eq('proset', null)
        .eq('selectedBy', player._id)
    })
    .collect()

  if (isProset(currentlySelected)) {
    const prosetId = await db.insert('Proset', {
      player: player._id,
    })
    currentlySelected.forEach((selectedCard) => {
      db.patch(selectedCard._id, {
        proset: prosetId,
      })
    })
    clearSelectSet(db, card.game)
    db.patch(player._id, {
      score: player.score + 1,
    })
    return 'FoundProset'
  }
})

function isProset(cards: Document<'PlayingCard'>[]) {
  const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'] as const
  return colors.every((color) => {
    return cards.reduce(
      (isEven: boolean, currentCard: Document<'PlayingCard'>) => {
        if (currentCard[color]) {
          isEven = !isEven
        }
        return isEven
      },
      true
    )
  })
}
