import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  // Override the auth users table to add billing fields.
  // `plan` is denormalized from subscriptions so it is visible in the
  // Convex dashboard without a join.
  users: defineTable({
    // ── Convex Auth required fields ──────────────────────────────────────
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // ── App fields ───────────────────────────────────────────────────────
    plan: v.optional(
      v.union(v.literal("free"), v.literal("trialing"), v.literal("paid"))
    ),
    planUpdatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  documents: defineTable({
    userId: v.id("users"),
    name: v.string(),
    storageId: v.id("_storage"),
    uploadedAt: v.number(),
    pageCount: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  flashcardDecks: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    deckName: v.string(),
    pageRangeStart: v.number(),
    pageRangeEnd: v.number(),
    cardCountPreset: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_document", ["documentId"]),

  flashcards: defineTable({
    deckId: v.id("flashcardDecks"),
    front: v.string(),
    back: v.string(),
    order: v.number(),
    isNew: v.boolean(),
  }).index("by_deck", ["deckId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    polarCustomerId: v.string(),
    polarSubscriptionId: v.string(),
    status: v.string(),
    trialEndMs: v.optional(v.number()),
    currentPeriodEndMs: v.optional(v.number()),
    priceId: v.optional(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_polar_customer", ["polarCustomerId"]),

  studyGuides: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    title: v.string(),
    topic: v.string(),
    content: v.string(),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_document", ["documentId"]),

  quizDecks: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    deckName: v.string(),
    pageRangeStart: v.number(),
    pageRangeEnd: v.number(),
    questionCountPreset: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_document", ["documentId"]),

  quizQuestions: defineTable({
    deckId: v.id("quizDecks"),
    question: v.string(),
    correctAnswer: v.string(),
    distractor1: v.string(),
    distractor2: v.string(),
    order: v.number(),
  }).index("by_deck", ["deckId"]),

  flashcardDeckProgress: defineTable({
    userId: v.id("users"),
    deckId: v.id("flashcardDecks"),
    cardsMastered: v.number(),
    totalCards: v.number(),
    lastScorePercent: v.number(),
    bestScorePercent: v.number(),
    lastStudiedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_deck", ["userId", "deckId"]),

  quizDeckProgress: defineTable({
    userId: v.id("users"),
    deckId: v.id("quizDecks"),
    questionsAnswered: v.number(),
    totalQuestions: v.number(),
    lastScorePercent: v.number(),
    bestScorePercent: v.number(),
    lastStudiedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_deck", ["userId", "deckId"]),

  newUserAdminNotified: defineTable({
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  mockExamSessions: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
    title: v.string(),
    examType: v.string(), // e.g. "nclex-rn"
    timeLimitMinutes: v.number(),
    questions: v.array(v.object({
      question: v.string(),
      correctAnswer: v.string(),
      distractor1: v.string(),
      distractor2: v.string(),
      distractor3: v.optional(v.string()),
    })),
    answers: v.optional(v.array(v.object({
      questionIndex: v.number(),
      selectedAnswer: v.string(),
    }))),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    scorePercent: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_exam_type", ["userId", "examType"]),
});