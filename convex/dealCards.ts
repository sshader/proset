import { PaginationOptions, PaginationResult } from 'convex/server'
import { Doc, Id } from './_generated/dataModel'
import { query } from './_generated/server';
import { QueryCtx, queryWithEnt } from './lib/functions';

export default queryWithEnt(
  async (
    ctx,
    args: { gameId: Id<'Games'>; paginationOpts: PaginationOptions }
  ): Promise<PaginationResult<Doc<'PlayingCards'>>> => {
    return ctx.table("PlayingCards", "ByGameAndProsetAndRank", q => q.eq("GameId", args.gameId).eq("proset", null)).paginate(args.paginationOpts)
  }
)
