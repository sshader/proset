
  
  import { internalAction } from "../_generated/server.js";
  import { analyzeModuleGroups } from "./helpers";
  import * as players from "../players.js";
import * as prosetHelpers from "../prosetHelpers.js";
import * as queries_getOngoingGames from "../queries/getOngoingGames.js";
import * as revealProset from "../revealProset.js";
import * as types_game_info from "../types/game_info.js";
  export default internalAction((ctx) => {
    return analyzeModuleGroups({
      "players.js": players,
"prosetHelpers.js": prosetHelpers,
"queries/getOngoingGames.js": queries_getOngoingGames,
"revealProset.js": revealProset,
"types/game_info.js": types_game_info,
    })
  })
  