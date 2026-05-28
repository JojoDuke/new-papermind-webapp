/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ResendPasswordReset from "../ResendPasswordReset.js";
import type * as auth from "../auth.js";
import type * as documents from "../documents.js";
import type * as flashcards from "../flashcards.js";
import type * as http from "../http.js";
import type * as newUserAdminEmail from "../newUserAdminEmail.js";
import type * as progress from "../progress.js";
import type * as quizzes from "../quizzes.js";
import type * as studyGuides from "../studyGuides.js";
import type * as subscriptions from "../subscriptions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendPasswordReset: typeof ResendPasswordReset;
  auth: typeof auth;
  documents: typeof documents;
  flashcards: typeof flashcards;
  http: typeof http;
  newUserAdminEmail: typeof newUserAdminEmail;
  progress: typeof progress;
  quizzes: typeof quizzes;
  studyGuides: typeof studyGuides;
  subscriptions: typeof subscriptions;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {};
