/** True when a Convex/API error indicates the user hit a free-tier limit. */
export function isUpgradeRequiredError(err: unknown): boolean {
  if (err instanceof Error) {
    if (err.message.includes("upgrade_required")) return true;
    const data = (err as Error & { data?: unknown }).data;
    if (
      typeof data === "object" &&
      data !== null &&
      "code" in data &&
      (data as { code?: string }).code === "upgrade_required"
    ) {
      return true;
    }
  }
  if (typeof err === "string") return err.includes("upgrade_required");
  return false;
}

export function upgradeRequiredMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) {
    const match = err.message.match(/upgrade_required:\s*(.+)/i);
    if (match?.[1]) return match[1].trim();
    if (err.message && !err.message.includes("[CONVEX")) return err.message;
  }
  return fallback;
}
