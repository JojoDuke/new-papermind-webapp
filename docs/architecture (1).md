# Papermind – App Architecture Overview

**Company:** Bhyte Software  
**Last Updated:** March 2026

---

## Folder Structure

```
papermind/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Marketing site route group
│   │   ├── page.tsx              # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   └── blog/
│   │       ├── page.tsx          # Blog index
│   │       └── [slug]/page.tsx   # Individual post
│   ├── (auth)/                   # Auth route group
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   └── onboarding/page.tsx
│   ├── (app)/                    # Protected app route group
│   │   ├── dashboard/page.tsx
│   │   ├── study/
│   │   │   ├── [id]/page.tsx     # Study set view
│   │   │   ├── flashcards/page.tsx
│   │   │   ├── quiz/page.tsx
│   │   │   └── exam/page.tsx
│   │   └── account/
│   │       ├── page.tsx          # Profile & settings
│   │       └── billing/page.tsx
│   ├── api/                      # API routes
│   │   ├── webhooks/
│   │   │   └── polar/route.ts    # Polar billing webhooks
│   │   └── upload/route.ts       # File upload handler
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/                   # Shared UI components
│   ├── ui/                       # Base components (buttons, inputs, etc.)
│   ├── marketing/                # Marketing site components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   └── ...
│   └── app/                      # App/dashboard components
│       ├── Sidebar.tsx
│       ├── FlashcardViewer.tsx
│       ├── QuizInterface.tsx
│       └── ...
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema
│   ├── users.ts                  # User mutations & queries
│   ├── studySets.ts              # Study set logic
│   ├── flashcards.ts
│   ├── quizzes.ts
│   ├── uploads.ts                # File handling
│   └── ai.ts                     # AI generation actions
├── lib/                          # Utilities & helpers
│   ├── ai/                       # AI & Mastra logic
│   │   ├── mastra.ts             # Mastra agent setup
│   │   ├── generateFlashcards.ts
│   │   ├── generateQuiz.ts
│   │   └── generateGuide.ts
│   ├── pdf/                      # PDF parsing logic (TBD)
│   └── utils.ts
├── providers/                    # React context providers
│   ├── ConvexProvider.tsx
│   ├── ClerkProvider.tsx
│   └── PostHogProvider.tsx
├── docs/                         # Project documentation
│   ├── prd.md
│   ├── tech-stack.md
│   └── architecture.md
├── public/                       # Static assets
│   └── images/
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## Data Architecture (Convex Schema)

```ts
// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    goal: v.optional(v.union(v.literal("student"), v.literal("professional"))),
    examType: v.optional(v.string()),
    onboardingComplete: v.boolean(),
    plan: v.union(v.literal("starter"), v.literal("pro"), v.literal("teams")),
    polarSubscriptionId: v.optional(v.string()),
  }).index("by_clerk_id", ["clerkId"]),

  studySets: defineTable({
    userId: v.id("users"),
    title: v.string(),
    sourceFileId: v.optional(v.id("_storage")),
    sourceText: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("ready"), v.literal("failed")),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  flashcards: defineTable({
    studySetId: v.id("studySets"),
    front: v.string(),
    back: v.string(),
    known: v.boolean(),
    order: v.number(),
  }).index("by_study_set", ["studySetId"]),

  quizzes: defineTable({
    studySetId: v.id("studySets"),
    questions: v.array(v.object({
      question: v.string(),
      options: v.array(v.string()),
      correctIndex: v.number(),
    })),
    createdAt: v.number(),
  }).index("by_study_set", ["studySetId"]),

  quizAttempts: defineTable({
    userId: v.id("users"),
    quizId: v.id("quizzes"),
    score: v.number(),
    answers: v.array(v.number()),
    completedAt: v.number(),
  }).index("by_user", ["userId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    polarSubscriptionId: v.string(),
    plan: v.string(),
    status: v.string(),
    currentPeriodEnd: v.number(),
  }).index("by_user", ["userId"]),
});
```

---

## AI Generation Flow

```
User uploads PDF
      │
      ▼
File stored in Convex storage
      │
      ▼
PDF parsing (LlamaParse / TBD) extracts raw text
      │
      ▼
Mastra AI agent receives extracted text
      │
      ├──► Generate flashcards (key terms & definitions)
      ├──► Generate quiz questions (multiple choice)
      └──► Generate learning guide (structured summary)
      │
      ▼
Results saved to Convex database
      │
      ▼
Study set status updated to "ready"
      │
      ▼
User notified — study set available
```

---

## Auth Flow (Clerk + Convex)

```
User signs up/logs in via Clerk
      │
      ▼
Clerk issues JWT session token
      │
      ▼
Convex verifies token on every request
      │
      ▼
User record fetched/created in Convex users table
      │
      ▼
Plan/subscription status checked
      │
      ▼
Features gated based on plan
```

---

## Billing Flow (Polar)

```
User selects plan → Polar checkout
      │
      ▼
Payment successful
      │
      ▼
Polar sends webhook to /api/webhooks/polar
      │
      ▼
Convex subscription record created/updated
      │
      ▼
User plan updated in users table
      │
      ▼
Features unlocked in app
```

---

## Route Protection

All routes under `(app)/` are protected via Clerk middleware. Unauthenticated users are redirected to `/sign-in`. Users who haven't completed onboarding are redirected to `/onboarding`.

```ts
// middleware.ts
import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/pricing", "/about", "/contact", "/blog(.*)"],
});
```

---

## Key Conventions

- All database operations go through Convex queries and mutations — never direct DB calls from the frontend
- Server components fetch data where possible, client components used only where interactivity is needed
- All AI generation happens in Convex actions (server-side) — API keys never exposed to client
- Feature gating checked server-side via user's plan in Convex
- PostHog events fired on all key user actions (upload, quiz complete, flashcard session started, etc.)
