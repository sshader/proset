import { internal } from '../_generated/api'
import { MutationCtx } from '../lib/functions'

export const send = async (
  ctx: MutationCtx,
  {
    content,
    isPrivate,
  }: {
    content: string
    isPrivate?: boolean
  }
) => {
  isPrivate = isPrivate ?? false
  const messageId = await ctx.table("Messages").insert({
    GameId: ctx.game._id,
    player: isPrivate ? ctx.player._id : null,
    content
  })
  await ctx.scheduler.runAfter(5 * 1000, internal.message.remove, {
    messageId,
  })
}
