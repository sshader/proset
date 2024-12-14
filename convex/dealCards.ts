import { PaginationResult, paginationOptsValidator } from 'convex/server'
import { v } from 'convex/values'
import { Doc } from './_generated/dataModel'
import { queryWithEnt } from './lib/functions'

export default queryWithEnt({
  args: { gameId: v.id('Games'), paginationOpts: paginationOptsValidator },
  returns: v.object({
    page: v.array(
      v.object({
        GameId: v.id('Games'),
        blue: v.boolean(),
        green: v.boolean(),
        orange: v.boolean(),
        proset: v.union(v.null(), v.id('Prosets')),
        purple: v.boolean(),
        rank: v.float64(),
        red: v.boolean(),
        selectedBy: v.union(v.null(), v.id('Players')),
        yellow: v.boolean(),
        _id: v.id('PlayingCards'),
        _creationTime: v.number(),
      })
    ),
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
