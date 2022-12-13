import { mutation } from './_generated/server'

export default mutation(async ({ db }, name: string) => {
  const gameId = await db.insert('Game', {
    name,
    selectingPlayer: null,
    selectionStartTime: null,
    inProgress: true,
  })

  await db.insert('Player', {
    name: 'System Player',
    game: gameId,
    tokenIdentifier: '',
    score: 0,
    color: 'grey',
    isSystemPlayer: true,
  })

  const cardNumbers = []
  for (let i = 1; i <= 63; i += 1) {
    cardNumbers.push(i)
  }
  shuffleArray(cardNumbers)

  await Promise.all(
    cardNumbers.map((cardNumber, cardIndex) => {
      return db.insert('PlayingCard', {
        game: gameId,
        rank: cardIndex,
        proset: null,
        red: cardNumber % 2 === 1,
        orange: (cardNumber >> 1) % 2 === 1,
        yellow: (cardNumber >> 2) % 2 === 1,
        green: (cardNumber >> 3) % 2 === 1,
        blue: (cardNumber >> 4) % 2 === 1,
        purple: (cardNumber >> 5) % 2 === 1,
        selectedBy: null,
      })
    })
  )

  return { state: 'NewGame', gameId }
})

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}
