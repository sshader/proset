import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(async ({ db }, gameId: Id<'Game'>) => {
  return await db.insert('Player', {
    game: gameId,
  })
})
