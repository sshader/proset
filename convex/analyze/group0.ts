
  
  import { internalAction } from "../_generated/server.js";
  import { analyzeModuleGroups } from "./helpers";
  import * as players from "../players.js";
import * as prosetHelpers from "../prosetHelpers.js";
import * as queries_getOngoingGames from "../queries/getOngoingGames.js";
import * as revealProset from "../revealProset.js";
import * as types_game_info from "../types/game_info.js";
import * as types_player_colors from "../types/player_colors.js";
import * as users from "../users.js";
import * as lib_withOutput from "../lib/withOutput.js";
import * as lib_withOutputForked from "../lib/withOutputForked.js";
import * as message from "../message.js";

  export default internalAction((ctx) => {
    return analyzeModuleGroups({
      "players.js": players,
"prosetHelpers.js": prosetHelpers,
"queries/getOngoingGames.js": queries_getOngoingGames,
"revealProset.js": revealProset,
"types/game_info.js": types_game_info,
"types/player_colors.js": types_player_colors,
"users.js": users,
"lib/withOutput.js": lib_withOutput,
"lib/withOutputForked.js": lib_withOutputForked,
"message.js": message,
    })
  })
  