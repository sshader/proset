
  
  import { internalAction } from "../_generated/server.js";
  import { analyzeModuleGroups } from "./helpers";
  import * as model_cards from "../model/cards.js";
import * as model_game from "../model/game.js";
import * as model_message from "../model/message.js";
import * as model_player from "../model/player.js";
import * as model_user from "../model/user.js";
  export default internalAction((ctx) => {
    return analyzeModuleGroups({
      "model/cards.js": model_cards,
"model/game.js": model_game,
"model/message.js": model_message,
"model/player.js": model_player,
"model/user.js": model_user,
    })
  })
  