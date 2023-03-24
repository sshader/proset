/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@0.11.0.
 * To regenerate, run `npx convex codegen`.
 * @module
 */

import {
  actionGeneric,
  cronJobsGeneric,
  httpEndpointGeneric,
  mutationGeneric,
  queryGeneric,
} from "convex/server";

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read your Convex database and will be accessible from the client.
 *
 * @param func - The query function. It receives a {@link QueryCtx} as its first argument.
 * @returns The wrapped query. Include this as an `export` to name it and make it accessible.
 */
export const query = queryGeneric;

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function will be allowed to modify your Convex database and will be accessible from the client.
 *
 * @param func - The mutation function. It receives a {@link MutationCtx} as its first argument.
 * @returns The wrapped mutation. Include this as an `export` to name it and make it accessible.
 */
export const mutation = mutationGeneric;

/**
 * Define an action in this Convex app's public API.
 *
 * An action is a function which can execute any JavaScript code, including non-deterministic
 * code and code with side-effects. Actions are often used to call into third-party services.
 * Actions execute in a Node.js environment and can interact with the database indirectly by
 * calling queries and mutations via the provided {@link ActionCtx} object. Actions need to be defined
 * in the `/convex/actions  directory`. Queries and mutations, on the other hand, must be defined
 * outside of the `/convex/actions directory`.
 *
 * @param func - The action. It receives a {@link ActionCtx} as its first argument.
 * @returns The wrapped action. Include this as an `export` to name it and make it accessible.
 */
export const action = actionGeneric;

/**
 * Define a Convex HTTP endpoint.
 *
 * @param func - The function. It receives an {@link HttpEndpointCtx} as its first argument, and a `Request` object
 * as its second.
 * @returns The wrapped endpoint function. Route a URL path to this function in `convex/http.js`.
 */
export const httpEndpoint = httpEndpointGeneric;

/**
 * Returns a cron job scheduler, used to schedule Convex functions to run on a recurring basis.
 *
 * ```js
 * // convex/crons.js
 * import { cronJobs } from './_generated/server';
 *
 * const crons = cronJobs();
 * crons.weekly(
 *   "weekly re-engagement email",
 *   {
 *     hourUTC: 17, // (9:30am Pacific/10:30am Daylight Savings Pacific)
 *     minuteUTC: 30,
 *   },
 *   "sendEmails"
 * )
 * export default crons;
 * ```
 *
 * @returns The cron job scheduler object. Create this object in `convex/crons.js` and export it
 * as the default export.
 */
export const cronJobs = cronJobsGeneric;
