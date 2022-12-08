/* eslint-disable */
/**
 * Generated API.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@0.5.0.
 * To regenerate, run `npx convex codegen`.
 * @module
 */

import type { ApiFromModules } from "convex/api";
import type * as dealCards from "../dealCards";
import type * as getGameInfo from "../getGameInfo";
import type * as joinGame from "../joinGame";
import type * as selectCard from "../selectCard";
import type * as startGame from "../startGame";
import type * as unselectCard from "../unselectCard";

/**
 * A type describing your app's public Convex API.
 *
 * This `API` type includes information about the arguments and return
 * types of your app's query and mutation functions.
 *
 * This type should be used with type-parameterized classes like
 * `ConvexReactClient` to create app-specific types.
 */
export type API = ApiFromModules<{
  dealCards: typeof dealCards;
  getGameInfo: typeof getGameInfo;
  joinGame: typeof joinGame;
  selectCard: typeof selectCard;
  startGame: typeof startGame;
  unselectCard: typeof unselectCard;
}>;
