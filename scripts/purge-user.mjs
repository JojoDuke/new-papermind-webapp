/**
 * Wipe all Convex + storage data for a user by email (dev/testing).
 *
 * Usage:
 *   npm run purge:user -- you@example.com
 *
 * Requires in .env.local (and Convex dashboard for remote):
 *   DEV_PURGE_SECRET=some-long-random-string
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  const path = resolve(root, ".env.local");
  if (!existsSync(path)) return {};
  const text = readFileSync(path, "utf8");
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const email = process.argv[2]?.trim();
if (!email) {
  console.error("Usage: npm run purge:user -- you@example.com");
  process.exit(1);
}

const env = { ...process.env, ...loadEnvLocal() };
const secret = env.DEV_PURGE_SECRET?.trim();
if (!secret) {
  console.error(
    "Missing DEV_PURGE_SECRET in .env.local (and Convex env if using a remote deployment).",
  );
  process.exit(1);
}

const argsJson = JSON.stringify({ email, secret });
// Do not pass --env-file to `convex run` — it can block the CLI access token and cause 401.
// DEV_PURGE_SECRET for the mutation must live on the Convex deployment (`.env.local` is
// synced when `npx convex dev` runs, or set it in the Convex dashboard).
const convexCli = resolve(root, "node_modules/convex/bin/main.js");
const result = spawnSync(
  process.execPath,
  [convexCli, "run", "devTools:purgeUserByEmail", argsJson],
  { cwd: root, encoding: "utf8", windowsHide: true },
);

const out = `${result.stdout ?? ""}${result.stderr ?? ""}`;
if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status !== 0) {
  if (out.includes("MissingAccessToken") || out.includes("401 Unauthorized")) {
    console.error(`
Convex CLI is not logged in (separate from "npx convex dev" running).

Fix — pick one:
  1. Run once:  npx convex login
     Then retry: npm run purge:user -- ${email}

  2. Convex Dashboard → your deployment → Functions
     → devTools:purgeUserByEmail → Run:
     {"email":"${email}","secret":"<DEV_PURGE_SECRET from .env.local>"}
`);
  }
}

process.exit(result.status ?? 1);
