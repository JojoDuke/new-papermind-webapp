/** Build an absolute post-auth redirect URL for the current app origin. */
export function authRedirectUrl(path: string): string {
  const normalized =
    path.startsWith("/") || path.startsWith("?") ? path : `/${path}`;

  if (typeof window !== "undefined") {
    return `${window.location.origin.replace(/\/$/, "")}${normalized}`;
  }

  const base = (
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
  return `${base}${normalized}`;
}
