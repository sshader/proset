/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.12.1.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as cards from "../cards.js";
import type * as dealCards from "../dealCards.js";
import type * as functions from "../functions.js";
import type * as games from "../games.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_middlewareUtils from "../lib/middlewareUtils.js";
import type * as lib_validators from "../lib/validators.js";
import type * as message from "../message.js";
import type * as model_cards from "../model/cards.js";
import type * as model_game from "../model/game.js";
import type * as model_message from "../model/message.js";
import type * as model_player from "../model/player.js";
import type * as model_user from "../model/user.js";
import type * as players from "../players.js";
import type * as prosetHelpers from "../prosetHelpers.js";
import type * as queries_getOngoingGames from "../queries/getOngoingGames.js";
import type * as revealProset from "../revealProset.js";
import type * as types_game_info from "../types/game_info.js";
import type * as types_player_colors from "../types/player_colors.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  cards: typeof cards;
  dealCards: typeof dealCards;
  functions: typeof functions;
  games: typeof games;
  "lib/functions": typeof lib_functions;
  "lib/middlewareUtils": typeof lib_middlewareUtils;
  "lib/validators": typeof lib_validators;
  message: typeof message;
  "model/cards": typeof model_cards;
  "model/game": typeof model_game;
  "model/message": typeof model_message;
  "model/player": typeof model_player;
  "model/user": typeof model_user;
  players: typeof players;
  prosetHelpers: typeof prosetHelpers;
  "queries/getOngoingGames": typeof queries_getOngoingGames;
  revealProset: typeof revealProset;
  "types/game_info": typeof types_game_info;
  "types/player_colors": typeof types_player_colors;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
