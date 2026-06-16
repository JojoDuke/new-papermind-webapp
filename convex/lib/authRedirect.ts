function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, "");
}

function allowedOrigins(): string[] {
  const configured = process.env.ALLOWED_REDIRECT_ORIGINS;
  const defaults = [
    process.env.SITE_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://www.usepapermind.app",
    "https://usepapermind.app",
  ].filter((value): value is string => Boolean(value));

  const fromEnv =
    configured?.split(",").map((value) => normalizeOrigin(value.trim())) ?? [];

  return [...new Set([...fromEnv, ...defaults.map(normalizeOrigin)])];
}

function defaultSiteUrl(): string {
  return normalizeOrigin(process.env.SITE_URL ?? "http://localhost:3000");
}

function isAllowedAbsoluteRedirect(redirectTo: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(redirectTo);
  } catch {
    return false;
  }

  const origin = `${parsed.protocol}//${parsed.host}`;
  return allowedOrigins().some(
    (allowed) =>
      origin === allowed ||
      redirectTo === allowed ||
      redirectTo.startsWith(`${allowed}/`) ||
      redirectTo.startsWith(`${allowed}?`),
  );
}

/** Resolve OAuth / magic-link redirects for local dev and production. */
export async function resolveAuthRedirect(params: {
  redirectTo?: string;
}): Promise<string> {
  const { redirectTo } = params;

  if (redirectTo === undefined) {
    return defaultSiteUrl();
  }

  if (typeof redirectTo !== "string") {
    throw new Error(`Expected \`redirectTo\` to be a string, got ${redirectTo}`);
  }

  if (redirectTo.startsWith("?") || redirectTo.startsWith("/")) {
    return `${defaultSiteUrl()}${redirectTo}`;
  }

  if (!isAllowedAbsoluteRedirect(redirectTo)) {
    throw new Error(
      `Invalid \`redirectTo\` ${redirectTo}. Allowed origins: ${allowedOrigins().join(", ")}`,
    );
  }

  return redirectTo;
}
