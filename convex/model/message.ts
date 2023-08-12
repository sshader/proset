import { internal } from '../_generated/api'
import { Doc } from '../_generated/dataModel'
import { MutationCtx } from '../_generated/server'

export const send = async (
  ctx: MutationCtx,
  {
    content,
    isPrivate,
    player,
  }: {
    content: string
    isPrivate?: boolean
    player: Doc<'Player'>
  }
) => {
  const { db, scheduler } = ctx
  isPrivate = isPrivate ?? false
  const messageId = await db.insert('Message', {
    game: player.game,
    player: isPrivate ? player._id : null,
    content,
  })
  await scheduler.runAfter(5 * 1000, internal.message.remove, {
    messageId,
  })
}
