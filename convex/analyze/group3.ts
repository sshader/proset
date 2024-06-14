
  
  import { internalAction } from "../_generated/server.js";
  import { analyzeModuleGroups } from "./helpers";
  import * as cards from "../cards.js";
import * as dealCards from "../dealCards.js";
import * as functions from "../functions.js";
import * as games from "../games.js";
import * as lib_functions from "../lib/functions.js";
  export default internalAction((ctx) => {
    return analyzeModuleGroups({
      "cards.js": cards,
"dealCards.js": dealCards,
"functions.js": functions,
"games.js": games,
"lib/functions.js": lib_functions,
    })
  })
  