/**
 * Resend API smoke test — prints the real HTTP response so you can see errors.
 *
 * 1) Put in .env.local (or your shell):
 *    RESEND_API_KEY=re_...
 *    RESEND_FROM=Papermind <hello@usepapermind.app>
 *    (optional) TEST_RESEND_TO=you@gmail.com
 *
 * 2) Run from repo root:
 *    npm run test:resend
 *
 * If successful: Resend returns 200 and {"id":"..."}; the email appears in
 * Resend → Emails. If the API key is wrong or `from` is invalid, the JSON body
 * explains the problem.
 */
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const key = process.env.RESEND_API_KEY;
const from =
  process.env.RESEND_FROM ?? "Papermind <hello@usepapermind.app>";
const to = process.env.TEST_RESEND_TO ?? process.env.NEW_USER_NOTIFY_TO;
const overrideTo = process.argv[2];
const recipient = overrideTo || to;

if (!key) {
  console.error("Missing RESEND_API_KEY. Add it to .env.local.");
  process.exit(1);
}
if (!recipient) {
  console.error(
    "Set TEST_RESEND_TO=your@email.com in .env.local, or: npm run test:resend -- you@gmail.com",
  );
  process.exit(1);
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [recipient],
    subject: "Papermind / Resend smoke test",
    text: "If you see this in Resend → Emails, the key and from address are working.",
  }),
});

const body = await res.text();
console.log("HTTP", res.status);
console.log(body);
if (!res.ok) {
  process.exit(1);
}
