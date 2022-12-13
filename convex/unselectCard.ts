import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(async ({ db, auth }, cardId: Id<'PlayingCard'>) => {
  const card = (await db.get(cardId))!
  const player = getPlayer(db, auth, card.game)
  if (!card.selectedBy?.equals((await player)._id)) {
    return { reason: 'Not selected by player', selectedBy: card.selectedBy }
  }
  await db.patch(card._id, {
    selectedBy: null
  })
})
