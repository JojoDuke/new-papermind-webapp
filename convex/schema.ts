import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
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
});