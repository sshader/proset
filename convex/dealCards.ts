import { PaginationOptions, PaginationResult } from 'convex/server'
import { Doc, Id } from './_generated/dataModel'
import { query } from './_generated/server';

export default query(
  async (
    { db },
    args: { gameId: Id<'Game'>; paginationOpts: PaginationOptions }
  ): Promise<PaginationResult<Doc<'PlayingCard'>>> => {
    return await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndRank', (q) =>
        q.eq('game', args.gameId).eq('proset', null)
      )
      .paginate(args.paginationOpts)
  }
)
