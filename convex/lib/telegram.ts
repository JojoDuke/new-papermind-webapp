const TELEGRAM_API = "https://api.telegram.org";

export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
): Promise<void> {
  const res = await fetch(`${TELEGRAM_API}/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const body = (await res.json()) as { ok?: boolean; description?: string };

  if (!res.ok || body.ok === false) {
    throw new Error(
      `Telegram failed: ${res.status} ${body.description ?? JSON.stringify(body)}`,
    );
  }
}
