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

export function findProset(cards: Array<Doc<'PlayingCard'>>) {
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
