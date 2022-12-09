import { query } from './_generated/server'
import { Document, Id } from './_generated/dataModel'
import { PaginationOptions, PaginationResult } from 'convex/server'

export default query(
  async (
    { db },
    opts: PaginationOptions,
    game: Id<'Game'>
  ): Promise<PaginationResult<Document<'PlayingCard'>>> => {
    return await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndRank', (q) =>
        q.eq('game', game).eq('proset', null)
      )
      .paginate(opts)
  }
)
