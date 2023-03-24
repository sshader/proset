'use client'
import { PaginationOptions, PaginationResult } from 'convex/server'
import { Document, Id } from './_generated/dataModel'
import { query } from './_generated/server'

export default query(
  async (
    { db },
    opts: PaginationOptions,
    gameId: Id<'Game'>
  ): Promise<PaginationResult<Document<'PlayingCard'>>> => {
    return await db
      .query('PlayingCard')
      .withIndex('ByGameAndProsetAndRank', (q) =>
        q.eq('game', gameId).eq('proset', null)
      )
      .paginate(opts)
  }
)
