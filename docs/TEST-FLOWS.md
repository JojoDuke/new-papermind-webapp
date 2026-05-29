# Papermind — user flows to test & emulate

Use this as a checklist. Tick boxes as you go. Keep notes on failures (URL, error text, screenshot).

---

## Before you start

### Two testing modes

| Mode | `.env.local` | Use for |
|------|----------------|---------|
| **Prod-like** (billing + paywall) | `NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION=false` or removed | Signup → checkout → trial → dashboard |
| **Fast dev** (skip billing) | `NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION=true` | UI/features only; restart `npm run dev` after changing |

**Live (usepapermind.app):** bypass is always off (`NODE_ENV=production`). Subscription is required.

### Servers

```bash
# Terminal 1
npx convex dev

# Terminal 2
npm run dev
```

### Reset a test email (start fresh)

1. **Convex** (all app data + auth + PDF storage):
   ```bash
   npm run purge:user -- you@example.com
   ```
   Requires `DEV_PURGE_SECRET` in `.env.local` and on the Convex deployment (synced when `convex dev` runs).

2. **Polar** (billing retest with same email): cancel/delete customer in Polar **sandbox** dashboard.

3. **Browser:** incognito or clear cookies for `localhost:3000` / your domain.

---

## Flow A — New visitor → paid trial (ideal customer)

**Persona:** First-time student, lands on marketing site, wants Pro trial.

| Step | Action | Expected |
|------|--------|----------|
| A1 | Open `/` | Home loads; CTA → `/sign-up` |
| A2 | Click “Start Studying” / sign up | `/sign-up` |
| A3 | Sign up (email + password) or Google | Account created |
| A4 | After auth | Redirect to `/checkout?plan=pro&interval=monthly` (unless dev bypass) |
| A5 | On checkout | Copy: 7-day trial, card required, not charged until trial ends |
| A6 | Choose **Pro** + **Monthly** (or Starter — your choice) | Prices match `/pricing` |
| A7 | Continue → Polar embed | Card form loads |
| A8 | Complete Polar **sandbox** checkout | Success → `/checkout/success` → `/dashboard` |
| A9 | Convex `subscriptions` row | `status`: `trialing` (or `active`) |
| A10 | Use dashboard | No redirect back to `/checkout` |

**From pricing page:** `/sign-up?plan=starter&interval=yearly` → checkout should respect plan + interval.

**Pass criteria:** User reaches dashboard and can upload a PDF without hitting paywall again.

---

## Flow B — Returning subscriber (already trialing)

| Step | Action | Expected |
|------|--------|----------|
| B1 | Sign in at `/sign-in` | If no subscription → `/checkout` |
| B2 | Sign in with active trial/sub | → `/checkout` briefly or straight to dashboard |
| B3 | Open `/dashboard` directly | Stays on dashboard |

---

## Flow C — Forgot password

| Step | Action | Expected |
|------|--------|----------|
| C1 | `/sign-in` → **Forgot password?** | `/forgot-password` |
| C2 | Enter email → **Send reset code** | Success message (no error if Resend configured) |
| C3 | Email inbox | 8-digit code from Papermind |
| C4 | Enter code + new password | Redirect / sign-in; login works with new password |

**Note:** Google-only accounts have no password reset.

---

## Flow D — Core study loop (post-subscription)

**Persona:** Subscribed user uploads notes and studies.

| Step | Action | Expected |
|------|--------|----------|
| D1 | `/dashboard` | Upload zone + document list |
| D2 | Upload PDF | Progress → success modal (fox congrats) |
| D3 | Modal | Mentions 3 study guides created; links to library / generate more |
| D4 | **Study guides** → `/dashboard/study-guides` | Guides listed for document |
| D5 | Open a guide → `[guideId]` | Content renders; chat panel works |
| D6 | **Flashcards** → create from document modal | Deck created; study session saves progress |
| D7 | **Quizzes** → create from document | Deck created; MC quiz; progress saved |
| D8 | Dashboard home | Progress / continue studying updates (not stuck at 0%) |

**Pass criteria:** End-to-end: upload → at least one of flashcards / quizzes / study guides usable in one session.

---

## Flow E — Mock exams (paywall / upgrade)

| Step | Action | Expected |
|------|--------|----------|
| E1 | Sidebar → **Mock exams** | Pricing modal opens (Pro upsell) |
| E2 | Page content | Locked state + upgrade CTA |

*(Feature not fully shipped; modal + messaging is the expected behavior today.)*

---

## Flow F — Cancel / lose access (billing)

Test in **Polar sandbox**, not only in the app.

| Step | Action | Expected |
|------|--------|----------|
| F1 | Polar → cancel subscription | Webhook updates Convex `subscriptions.status` |
| F2 | Refresh `/dashboard` | Redirect to `/checkout` (`hasPaidAccess` false) |
| F3 | Marketing pages | Still accessible while logged out or logged in |

**Gap today:** no in-app “Manage billing” — cancel in Polar (or customer portal when added).

---

## Flow G — Legal & marketing

| Step | Action | Expected |
|------|--------|----------|
| G1 | Footer → **Privacy** | `/privacy` |
| G2 | Footer → **Terms** | `/terms` |
| G3 | Footer → **Contact** | *(still 404 unless you add `/contact`)* |

---

## Flow H — Fast local testing (no Polar)

Only when `NEXT_PUBLIC_DEV_BYPASS_SUBSCRIPTION=true`.

| Step | Action | Expected |
|------|--------|----------|
| H1 | Sign up | → `/dashboard` (skips checkout) |
| H2 | Test D4–D7 | Same as Flow D |

Do **not** use this mode to validate billing.

---

## Emulation cheat sheet

| I want to test… | Do this |
|-----------------|--------|
| Brand-new signup | `purge:user` + Polar delete + incognito |
| Checkout only | Sign up in prod-like mode; stop at Polar |
| Pro vs Starter checkout | `/sign-up?plan=starter` or `pro` + `&interval=yearly` |
| Full app without card | Dev bypass on + sign up |
| Password reset | Purge optional; use email/password account |
| “Trial ended” | Polar: end trial or cancel; reload dashboard |

---

## What to log when something fails

Copy into your notes:

1. **Flow ID** (e.g. A7)
2. **URL** and **account email**
3. **Browser** (incognito Y/N)
4. **Env:** bypass on/off, local vs production
5. **Error:** UI text, Network tab (`/api/polar/checkout`, `verify-checkout`), Convex logs
6. **Convex `subscriptions`** row for that user (status, `trialEndMs`)

---

## Suggested test order (one afternoon)

1. **H** — Smoke UI with bypass (30 min)
2. **A** — Full signup + Polar sandbox (30 min)
3. **D** — Study loop on that user (30 min)
4. **C** — Forgot password on a second test email (15 min)
5. **F** — Cancel in Polar; confirm paywall (15 min)

---

## Known gaps (not blockers for checklist)

- Starter vs Pro: same dashboard access today; plan not enforced per feature (except mock exams upsell).
- `/contact` missing.
- Settings → billing portal not built.
- API routes don’t all check subscription server-side (UI paywall only).

Update this doc when you add billing portal or plan-based gates.
