import { Document, Id } from './_generated/dataModel';
import { mutation } from './_generated/server'

export default mutation(async ({ db }, cardId: Id<"PlayingCard">, playerId: Id<"Player">) => {
  const card = (await db.get(cardId))!;
  if (!card.selectedBy?.equals(playerId)) {
    return { reason: "Not selected by player", selectedBy: card.selectedBy }
  }
  await db.patch(card._id, {
    selectedBy: null
  })
  console.log(await db.get(card._id))
})