import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(async ({ db, auth }, gameId: Id<'Game'>) => {
  await getPlayer(db, auth, gameId)
  await db.patch(gameId, {
    inProgress: false
  })
})
