/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audio from "../audio.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as blogAdmin from "../blogAdmin.js";
import type * as codeRun from "../codeRun.js";
import type * as contact from "../contact.js";
import type * as crons from "../crons.js";
import type * as debriefs from "../debriefs.js";
import type * as http from "../http.js";
import type * as lib_cerebras from "../lib/cerebras.js";
import type * as lib_email from "../lib/email.js";
import type * as lib_gemini from "../lib/gemini.js";
import type * as lib_groq from "../lib/groq.js";
import type * as lib_groqAudio from "../lib/groqAudio.js";
import type * as lib_judge0 from "../lib/judge0.js";
import type * as lib_mistral from "../lib/mistral.js";
import type * as lib_piston from "../lib/piston.js";
import type * as messages from "../messages.js";
import type * as prompts_Questionprompt from "../prompts/Questionprompt.js";
import type * as prompts_Scoringprompt from "../prompts/Scoringprompt.js";
import type * as prompts_debriefPrompt from "../prompts/debriefPrompt.js";
import type * as reminders from "../reminders.js";
import type * as sessions from "../sessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audio: typeof audio;
  auth: typeof auth;
  blog: typeof blog;
  blogAdmin: typeof blogAdmin;
  codeRun: typeof codeRun;
  contact: typeof contact;
  crons: typeof crons;
  debriefs: typeof debriefs;
  http: typeof http;
  "lib/cerebras": typeof lib_cerebras;
  "lib/email": typeof lib_email;
  "lib/gemini": typeof lib_gemini;
  "lib/groq": typeof lib_groq;
  "lib/groqAudio": typeof lib_groqAudio;
  "lib/judge0": typeof lib_judge0;
  "lib/mistral": typeof lib_mistral;
  "lib/piston": typeof lib_piston;
  messages: typeof messages;
  "prompts/Questionprompt": typeof prompts_Questionprompt;
  "prompts/Scoringprompt": typeof prompts_Scoringprompt;
  "prompts/debriefPrompt": typeof prompts_debriefPrompt;
  reminders: typeof reminders;
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
