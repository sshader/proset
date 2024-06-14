
  
  import { internalAction } from "../_generated/server.js";
  import { analyzeModuleGroups } from "./helpers";
  import * as types_player_colors from "../types/player_colors.js";
import * as users from "../users.js";
import * as lib_middlewareUtils from "../lib/middlewareUtils.js";
import * as lib_validators from "../lib/validators.js";
import * as message from "../message.js";
  export default internalAction((ctx) => {
    return analyzeModuleGroups({
      "types/player_colors.js": types_player_colors,
"users.js": users,
"lib/middlewareUtils.js": lib_middlewareUtils,
"lib/validators.js": lib_validators,
"message.js": message,
    })
  })
  