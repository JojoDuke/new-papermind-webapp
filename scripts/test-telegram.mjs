/**
 * Telegram Bot API smoke test — prints the real HTTP response so you can see errors.
 *
 * 1) Put in .env.local (or your shell):
 *    TELEGRAM_BOT_TOKEN=123456:ABC...
 *    NEW_USER_TELEGRAM_CHAT_ID=your_chat_id
 *
 * 2) Run from repo root:
 *    npm run test:telegram
 *
 * If successful: Telegram returns 200 and {"ok":true,...}; the message appears in
 * your chat. If the token is wrong or the bot cannot reach the chat, the JSON body
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

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.NEW_USER_TELEGRAM_CHAT_ID;

if (!botToken) {
  console.error("Missing TELEGRAM_BOT_TOKEN. Add it to .env.local.");
  process.exit(1);
}
if (!chatId) {
  console.error("Missing NEW_USER_TELEGRAM_CHAT_ID. Add it to .env.local.");
  process.exit(1);
}

const res = await fetch(
  `https://api.telegram.org/bot${botToken}/sendMessage`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: "<b>Papermind / Telegram smoke test</b>\n\nIf you see this, the bot token and chat id are working.",
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  },
);

const body = await res.text();
console.log("HTTP", res.status);
console.log(body);
if (!res.ok) {
  process.exit(1);
}

const json = JSON.parse(body);
if (json.ok === false) {
  process.exit(1);
}
