import { mutation } from './_generated/server'

export default mutation(async ({ db }, name: string) => {
  const existingGame = await db.query("Game").filter(q => q.eq(q.field("name"), name)).first();
  if (existingGame !== null) {
    return { state: "ExistingGame", gameId: existingGame._id }
  }
  
  const gameId = await db.insert("Game", {
    name
  });

  const cardNumbers = [...Array(64).keys()];
  shuffleArray(cardNumbers);

  cardNumbers.forEach((cardNumber, cardIndex) => {
    cardNumber += 1
    db.insert("PlayingCard", {
      game: gameId,
      rank: cardIndex,
      proset: null,
      red: (cardNumber % 2 === 1),
      orange: ((cardNumber >> 1) % 2 === 1),
      yellow: ((cardNumber >> 2) % 2 === 1),
      green: ((cardNumber >> 3) % 2 === 1),
      blue: ((cardNumber >> 4) % 2 === 1),
      purple: ((cardNumber >> 5) % 2 === 1),
      selectedBy: null,
    })
  });

  return { state: "NewGame", gameId };
})

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: Array<any>) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
}
