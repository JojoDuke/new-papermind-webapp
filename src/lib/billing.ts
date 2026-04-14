/** Free trial length for new subscriptions (Polar checkout). */
export const TRIAL_DAYS = 7;

export type BillingPlan = "starter" | "pro";
export type BillingInterval = "monthly" | "yearly";

/** Standard monthly list prices (USD). */
export const LIST_PRICE_MONTHLY_USD: Record<BillingPlan, number> = {
  starter: 12,
  pro: 29,
};

/**
 * Shown on yearly option (vs paying month-to-month at list price for 12 months).
 *
 * Math (20% off full annual at list rates, then rounded for clean marketing):
 * - Starter: $12×12 = $144 → 20% off = $115.20 → $115.20÷12 = $9.60/mo → round to **$9/mo** → **$108/yr**
 * - Pro: $29×12 = $348 → 20% off = $278.40 → $278.40÷12 = $23.20/mo → round to **$20/mo** → **$240/yr**
 *
 * Actual discount vs 12× monthly list: Starter ($144→$108) = 25% off; Pro ($348→$240) ≈ 31% off — the
 * round numbers are intentionally friendlier than strict 20% post-discount totals.
 */
export const YEARLY_SAVINGS_PERCENT = 20;

/** Effective monthly when customer pays annually (must match your Polar yearly product). */
export const YEARLY_EFFECTIVE_MONTHLY_USD: Record<BillingPlan, number> = {
  starter: 9,
  pro: 20,
};

/** Total USD charged per year on the annual plan (effective monthly × 12). */
export function yearlyChargeUsd(plan: BillingPlan): number {
  return YEARLY_EFFECTIVE_MONTHLY_USD[plan] * 12;
}

/** Same as yearly total ÷ 12 — the rounded “/mo billed annually” figure. */
export function effectiveMonthlyWhenYearly(plan: BillingPlan): number {
  return YEARLY_EFFECTIVE_MONTHLY_USD[plan];
}

export function formatUsd(amount: number, maximumFractionDigits = 2): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits,
  });
}
