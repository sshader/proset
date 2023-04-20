import { getPlayer } from './getPlayer'
import { Id } from './_generated/dataModel'
import { mutation } from './_generated/server'

export default mutation(async ({ db, auth }, args: { gameId: Id<'Game'> }) => {
  await getPlayer(db, auth, args.gameId)
  await db.patch(args.gameId, {
    inProgress: false,
  })
})
