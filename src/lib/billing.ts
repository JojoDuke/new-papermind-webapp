/** Free trial length for new subscriptions (Polar checkout). */
export const TRIAL_DAYS = 7;

export type BillingPlan = "starter";
export const DEFAULT_BILLING_PLAN: BillingPlan = "starter";
export type BillingInterval = "monthly" | "yearly";
export type UserPlan = "free" | "trialing" | "paid";

/** Human-readable label for `users.plan` (shown in profile menu, etc.). */
export function formatUserPlanLabel(plan: UserPlan | undefined): string {
  switch (plan) {
    case "paid":
      return "Paid plan";
    case "trialing":
      return "Free trial";
    case "free":
    default:
      return "Free plan";
  }
}

/** Tailwind classes for plan label under the user email. */
export function userPlanLabelClass(plan: UserPlan | undefined): string {
  switch (plan) {
    case "paid":
      return "text-emerald-600";
    case "trialing":
      return "text-blue-600";
    case "free":
    default:
      return "text-gray-500";
  }
}

/** Standard monthly list price (USD). */
export const LIST_PRICE_MONTHLY_USD = 12;

/**
 * Effective monthly when billed annually (must match Polar yearly product).
 * $12×12 = $144 → ~25% off annual = $108/yr → $9/mo
 */
export const YEARLY_EFFECTIVE_MONTHLY_USD = 9;

export const YEARLY_SAVINGS_PERCENT = 20;

export function monthlyListPrice(_plan: BillingPlan = DEFAULT_BILLING_PLAN): number {
  return LIST_PRICE_MONTHLY_USD;
}

export function effectiveMonthlyWhenYearly(_plan: BillingPlan = DEFAULT_BILLING_PLAN): number {
  return YEARLY_EFFECTIVE_MONTHLY_USD;
}

export function yearlyChargeUsd(_plan: BillingPlan = DEFAULT_BILLING_PLAN): number {
  return YEARLY_EFFECTIVE_MONTHLY_USD * 12;
}

export function formatUsd(amount: number, maximumFractionDigits = 2): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits,
  });
}
