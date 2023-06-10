import { cleanup } from './games'
import { cronJobs, internalMutation } from './_generated/server'
const crons = cronJobs()
crons.interval('clean up old data', { seconds: 60 }, 'crons:cleanupOldData', {})

export const cleanupOldData = internalMutation({
  handler: async (ctx) => {
    const { db } = ctx
    const game = await db
      .query('Game')
      .order('desc')
      .filter((q) => q.eq(q.field('inProgress'), false))
      .first()
    console.log(game)
    if (game !== null) {
      await cleanup(ctx, { gameId: game._id })
    }
  },
})

export default crons
