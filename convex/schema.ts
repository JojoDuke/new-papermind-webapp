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
  }).index("by_user", ["userId"]),

  flashcardDecks: defineTable({
    userId: v.id("users"),
    documentId: v.id("documents"),
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
});