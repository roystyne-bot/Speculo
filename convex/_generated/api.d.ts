/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as debriefs from "../debriefs.js";
import type * as http from "../http.js";
import type * as lib_groq from "../lib/groq.js";
import type * as messages from "../messages.js";
import type * as prompts_Questionprompt from "../prompts/Questionprompt.js";
import type * as prompts_Scoringprompt from "../prompts/Scoringprompt.js";
import type * as prompts_debriefPrompt from "../prompts/debriefPrompt.js";
import type * as sessions from "../sessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  debriefs: typeof debriefs;
  http: typeof http;
  "lib/groq": typeof lib_groq;
  messages: typeof messages;
  "prompts/Questionprompt": typeof prompts_Questionprompt;
  "prompts/Scoringprompt": typeof prompts_Scoringprompt;
  "prompts/debriefPrompt": typeof prompts_debriefPrompt;
  sessions: typeof sessions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
};
