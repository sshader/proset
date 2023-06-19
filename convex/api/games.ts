import * as Games from '../games'
import { mutation } from '../_generated/server';

export const start = mutation(async (ctx) => Games.start(ctx))

export const getOrCreate = mutation({
  handler: async (ctx) => Games.getOrCreate(ctx),
})
