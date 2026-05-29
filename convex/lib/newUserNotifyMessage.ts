export function buildNewUserTelegramMessage(args: {
  displayName: string;
  userEmail?: string;
}): string {
  const identifier =
    args.userEmail?.trim() || args.displayName.trim() || "unknown";
  return `1 new user (${escapeHtml(identifier)}) created an account on Papermind`;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
