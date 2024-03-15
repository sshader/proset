import { mutationWithGame } from './lib/functions'
import * as Cards from "./model/cards"

export default mutationWithGame({
  args: {},
  handler: async (ctx) => {
    return Cards.reveal(ctx)
  },
})
