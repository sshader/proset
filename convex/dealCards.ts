import { PaginationResult, paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'
import { Doc } from './_generated/dataModel'
import { queryWithEnt } from './lib/functions'
import { betterV } from './lib/validators'

export default queryWithEnt({
  args: { gameId: v.id('Games'), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(betterV.doc('PlayingCards')),
    isDone: v.boolean(),
    continueCursor: v.string(),
    splitCursor: v.optional(v.union(v.string(), v.null())),
    pageStatus: v.optional(
      v.union(
        v.literal('SplitRecommended'),
        v.literal('SplitRequired'),
        v.null()
      )
    ),
  }),
  handler: async (
    ctx,
    args
  ): Promise<PaginationResult<Doc<'PlayingCards'>>> => {
    return ctx
      .table('PlayingCards', 'ByGameAndProsetAndRank', (q) =>
        q.eq('GameId', args.gameId).eq('proset', null)
      )
      .paginate(args.paginationOpts)
  },
})
