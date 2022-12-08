import { Document, Id } from './_generated/dataModel';
import { mutation } from './_generated/server'

export default mutation(async ({ db }, cardId: Id<"PlayingCard">, playerId: Id<"Player">) => {
  const card = (await db.get(cardId))!;
  if (card.selectedBy !== null) {
    return { reason: "AlreadySelected", selectedBy: card.selectedBy }
  }
  db.patch(card._id, {
    selectedBy: playerId
  })

  const currentlySelected = await db.query("PlayingCard").withIndex("ByGameAndProsetAndSelectedBy", q => {
    return q.eq("game", card.game).eq("proset", null).eq("selectedBy", playerId)
  }).collect();

  console.log(currentlySelected, isProset(currentlySelected))

  if (isProset(currentlySelected)) {
    const prosetId = await db.insert("Proset", {
      player: playerId,
    });
    currentlySelected.forEach(selectedCard => {
      db.patch(selectedCard._id, {
        proset: prosetId
      })
    })
  }
})

function isProset(cards: Document<"PlayingCard">[]) {
  const colors = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
  return colors.every((color) => {
    return cards.reduce((isEven: boolean, currentCard: Document<"PlayingCard">) => {
      if (currentCard[color]) {
        isEven = !isEven
      }
      return isEven
    }, true)
  })
}
