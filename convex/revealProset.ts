import { v } from 'convex/values'
import { mutationWithGame } from './lib/functions'
import * as Cards from './model/cards'

export default mutationWithGame({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    return Cards.reveal(ctx)
  },
})
