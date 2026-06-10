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
import type * as devTools from "../devTools.js";
import type * as documents from "../documents.js";
import type * as flashcards from "../flashcards.js";
import type * as http from "../http.js";
import type * as lib_newUserNotifyMessage from "../lib/newUserNotifyMessage.js";
import type * as lib_telegram from "../lib/telegram.js";
import type * as mockExams from "../mockExams.js";
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
  devTools: typeof devTools;
  documents: typeof documents;
  flashcards: typeof flashcards;
  http: typeof http;
  "lib/newUserNotifyMessage": typeof lib_newUserNotifyMessage;
  "lib/telegram": typeof lib_telegram;
  mockExams: typeof mockExams;
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
