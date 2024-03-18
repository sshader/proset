
  
  import { internalAction } from "../_generated/server.js";
  import { analyzeModuleGroups } from "./helpers";
  import * as model_cards from "../model/cards.js";
import * as model_game from "../model/game.js";
import * as model_message from "../model/message.js";
import * as model_player from "../model/player.js";
import * as model_user from "../model/user.js";
import * as cards from "../cards.js";
import * as dealCards from "../dealCards.js";
import * as games from "../games.js";
import * as lib_functions from "../lib/functions.js";
import * as lib_middlewareUtils from "../lib/middlewareUtils.js";

  export default internalAction((ctx) => {
    return analyzeModuleGroups({
      "model/cards.js": model_cards,
"model/game.js": model_game,
"model/message.js": model_message,
"model/player.js": model_player,
"model/user.js": model_user,
"cards.js": cards,
"dealCards.js": dealCards,
"games.js": games,
"lib/functions.js": lib_functions,
"lib/middlewareUtils.js": lib_middlewareUtils,
    })
  })
  