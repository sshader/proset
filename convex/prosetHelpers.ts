import { Doc } from './_generated/dataModel'

export function isProset(cards: Array<Doc<'PlayingCard'>>) {
  if (cards.length === 0) {
    return false
  }
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
