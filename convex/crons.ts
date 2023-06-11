import { cleanup } from './games'
import { cronJobs, internalMutation } from './_generated/server'
const crons = cronJobs()
crons.interval('clean up old data', { hours: 24 }, 'crons:cleanupOldData', {})

export const cleanupOldData = internalMutation(async (ctx) => {
  const c = await ctx.db.query('Cleanup').first()
  if (c == null) {
    return
  }
  await cleanup(ctx, { gameId: c.gameId })
  const all = await ctx.db
    .query('Cleanup')
    .filter((q) => q.eq(q.field('gameId'), c.gameId))
    .collect()
  for (const doc of all) {
    await ctx.db.delete(doc._id)
  }
})

type Cursor = {
  tableName: string
  creationTime: number
}

export const markForCleanup = internalMutation({
  handler: async (ctx, args: { cursor?: Cursor }) => {
    const cursor = args.cursor ?? { tableName: 'Game', creationTime: 0 }
    let nextCursor: Cursor | null = null
    const { db, scheduler } = ctx
    switch (cursor.tableName) {
      case 'Game': {
        const games = await db
          .query('Game')
          .withIndex('by_creation_time', (q) =>
            q.gt('_creationTime', cursor.creationTime)
          )
          .filter((q) => q.eq(q.field('inProgress'), false))
          .take(100)
        for (const game of games) {
          await db.insert('Cleanup', { gameId: game._id })
        }
        const lastGame = games.at(-1)
        if (lastGame !== undefined) {
          nextCursor = {
            tableName: 'Game',
            creationTime: lastGame._creationTime,
          }
        } else {
          nextCursor = { tableName: 'Player', creationTime: 0 }
        }
        break
      }
      case 'Player': {
        const players = await db
          .query('Player')
          .withIndex('by_creation_time', (q) =>
            q.gt('_creationTime', cursor.creationTime)
          )
          .take(100)
        for (const player of players) {
          if ((await db.get(player.game)) === null) {
            await db.insert('Cleanup', { gameId: player.game })
          }
        }
        const lastPlayer = players.at(-1)
        if (lastPlayer !== undefined) {
          nextCursor = {
            tableName: 'Player',
            creationTime: lastPlayer._creationTime,
          }
        } else {
          nextCursor = { tableName: 'PlayingCard', creationTime: 0 }
        }
        break
      }
      case 'PlayingCard': {
        const cards = await db
          .query('PlayingCard')
          .withIndex('by_creation_time', (q) =>
            q.gt('_creationTime', cursor.creationTime)
          )
          .take(100)
        for (const card of cards) {
          if ((await db.get(card.game)) === null) {
            await db.insert('Cleanup', { gameId: card.game })
          }
        }
        const lastCard = cards.at(-1)
        if (lastCard !== undefined) {
          nextCursor = {
            tableName: 'PlayingCard',
            creationTime: lastCard._creationTime,
          }
        } else {
          nextCursor = { tableName: 'Proset', creationTime: 0 }
        }
        break
      }
      case 'Proset': {
        const prosets = await db
          .query('Proset')
          .withIndex('by_creation_time', (q) =>
            q.gt('_creationTime', cursor.creationTime)
          )
          .take(100)
        for (const proset of prosets) {
          if ((await db.get(proset.player)) === null) {
            await db.delete(proset._id)
          }
        }
        const lastProset = prosets.at(-1)
        if (lastProset !== undefined) {
          nextCursor = {
            tableName: 'Proset',
            creationTime: lastProset._creationTime,
          }
        }
        break
      }
    }

    if (nextCursor !== null) {
      await scheduler.runAfter(60 * 1000, 'crons:markForCleanup', {
        cursor: nextCursor,
      })
    }
  },
})

export default crons
