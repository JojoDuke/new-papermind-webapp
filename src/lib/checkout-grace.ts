/** Session keys — keep subscription sync / paywall redirects from ping-ponging. */
export const CHECKOUT_ACCESS_GRACE_KEY = 'pm_checkout_access_grace';
export const CHECKOUT_SUCCESS_NAV_KEY = 'pm_from_checkout_success';
export const PAYWALL_REDIRECT_AT_KEY = 'pm_paywall_redirect_at';

const GRACE_MS = 30 * 60 * 1000;

export function setCheckoutAccessGrace(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(
    CHECKOUT_ACCESS_GRACE_KEY,
    String(Date.now() + GRACE_MS)
  );
}

export function clearCheckoutAccessGrace(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CHECKOUT_ACCESS_GRACE_KEY);
}

export function hasCheckoutAccessGrace(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = sessionStorage.getItem(CHECKOUT_ACCESS_GRACE_KEY);
  if (!raw) return false;
  const until = Number(raw);
  if (Number.isNaN(until) || Date.now() >= until) {
    sessionStorage.removeItem(CHECKOUT_ACCESS_GRACE_KEY);
    return false;
  }
  return true;
}

export function markPaywallRedirectToCheckout(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PAYWALL_REDIRECT_AT_KEY, String(Date.now()));
}

export function wasRecentlyPaywalledToCheckout(withinMs = 8000): boolean {
  if (typeof window === 'undefined') return false;
  const raw = sessionStorage.getItem(PAYWALL_REDIRECT_AT_KEY);
  if (!raw) return false;
  const at = Number(raw);
  return !Number.isNaN(at) && Date.now() - at < withinMs;
}

export function markCheckoutSuccessNavigation(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CHECKOUT_SUCCESS_NAV_KEY, '1');
}

export function consumeCheckoutSuccessNavigation(): boolean {
  if (typeof window === 'undefined') return false;
  const v = sessionStorage.getItem(CHECKOUT_SUCCESS_NAV_KEY) === '1';
  sessionStorage.removeItem(CHECKOUT_SUCCESS_NAV_KEY);
  return v;
}
