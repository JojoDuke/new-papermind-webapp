# Papermind – Tech Stack

**Company:** Bhyte Software  
**Last Updated:** March 2026

---

## Overview

Papermind is a Next.js web application with Convex as the backend and database. The stack is chosen for speed of development, scalability, and minimal infrastructure overhead as a solo-built product.

---

## Frontend

| Tool | Purpose |
|------|---------|
| Next.js (App Router) | React framework, routing, server components |
| Tailwind CSS | Utility-first styling |
| PT Serif | Primary font — headings and display text |
| Plus Jakarta Sans | Secondary font — body, UI, navigation |

---

## Backend & Database

| Tool | Purpose |
|------|---------|
| Convex | Backend, real-time database, server functions, file storage |

Convex handles:
- Database (document-based, real-time)
- Server-side mutations and queries
- File storage for uploaded PDFs
- Background jobs / scheduled functions

---

## Authentication

| Tool | Purpose |
|------|---------|
| Clerk | User auth, session management, OAuth |

Clerk handles sign up, login, Google OAuth, password reset, email verification, and user management. Clerk tokens are verified by Convex on every request.

---

## AI & Document Processing

| Tool | Purpose |
|------|---------|
| Mastra AI | AI agent framework for orchestrating study generation workflows |
| PDF Parser | TBD — LlamaParse or Unstructured.io |
| AI Model | TBD — Claude API or OpenAI |

Mastra AI is used to build the agentic layer — orchestrating multi-step workflows like PDF extraction → content analysis → flashcard/quiz/guide generation.

---

## Payments

| Tool | Purpose |
|------|---------|
| Polar | Subscription billing, plan management |

Polar handles:
- Subscription creation and management
- Plan upgrades and downgrades
- Webhooks for subscription events (used to gate features in Convex)

---

## Analytics & Monitoring

| Tool | Purpose |
|------|---------|
| PostHog | Product analytics, session replays, feature flags |
| Google Analytics 4 | Marketing site traffic and attribution |

PostHog tracks in-app user behaviour. GA4 tracks marketing site traffic and conversion.

---

## Hosting & Deployment

| Tool | Purpose |
|------|---------|
| Vercel | Hosting, CI/CD, edge functions |

All deployments are via Vercel. Preview deployments on every PR. Production on `main` branch.

---

## Brand & Fonts Setup

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        serif: ['PT Serif', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        pink: {
          DEFAULT: '#FF4F8B',
          light: '#FFF0F5',
          mid: '#FFD6E7',
        },
        dark: '#1A1A2E',
        charcoal: '#2D2D3A',
        muted: '#6B6B80',
        border: '#F0E8ED',
        offwhite: '#FDFAF9',
        // Secondary accent (amber/orange — TBD exact value)
        amber: {
          DEFAULT: '#F5A623',
        }
      }
    }
  }
}
```

---

## Environment Variables

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Polar
POLAR_ACCESS_TOKEN=
POLAR_WEBHOOK_SECRET=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# AI (TBD)
ANTHROPIC_API_KEY=
# or
OPENAI_API_KEY=

# PDF Parser (TBD)
LLAMA_PARSE_API_KEY=
```
