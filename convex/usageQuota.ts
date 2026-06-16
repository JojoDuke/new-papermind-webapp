import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { isPaidUser } from "./lib/isPaidUser";

/** Free tier hard limits. null = unlimited (paid). */
export const FREE_LIMITS = {
  documents: 2,
  flashcardDecksPerDocument: 1,
  quizDecksPerDocument: 1,
  studyGuideSetsPerDocument: 1, // one generation run = one set
  mockExamsTotal: 1,            // one free preview exam across all docs
} as const;

export const getMyQuota = query({
  args: {},
  returns: v.object({
    isPaid: v.boolean(),
    documents: v.object({ used: v.number(), limit: v.union(v.number(), v.null()) }),
    mockExams: v.object({ used: v.number(), limit: v.union(v.number(), v.null()) }),
  }),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        isPaid: false,
        documents: { used: 0, limit: FREE_LIMITS.documents },
        mockExams: { used: 0, limit: FREE_LIMITS.mockExamsTotal },
      };
    }

    const paid = await isPaidUser(ctx, userId);

    const [docs, exams] = await Promise.all([
      ctx.db
        .query("documents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("mockExamSessions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    return {
      isPaid: paid,
      documents: {
        used: docs.length,
        limit: paid ? null : FREE_LIMITS.documents,
      },
      mockExams: {
        used: exams.length,
        limit: paid ? null : FREE_LIMITS.mockExamsTotal,
      },
    };
  },
});

/**
 * Check per-document limits (flashcard decks, quiz decks, study guide sets).
 * Called by API routes after auth.
 */
export const getDocumentQuota = query({
  args: { documentId: v.id("documents") },
  returns: v.object({
    isPaid: v.boolean(),
    flashcardDecks: v.object({ used: v.number(), limit: v.union(v.number(), v.null()) }),
    quizDecks: v.object({ used: v.number(), limit: v.union(v.number(), v.null()) }),
    studyGuides: v.object({ used: v.number(), limit: v.union(v.number(), v.null()) }),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const paid = await isPaidUser(ctx, userId);

    const [flashcardDecks, quizDecks, studyGuides] = await Promise.all([
      ctx.db
        .query("flashcardDecks")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .collect(),
      ctx.db
        .query("quizDecks")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .collect(),
      ctx.db
        .query("studyGuides")
        .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
        .collect(),
    ]);

    // Study guides: if any guides exist for this doc, the free set was used.
    const studyGuideRunsUsed = studyGuides.length > 0 ? 1 : 0;

    return {
      isPaid: paid,
      flashcardDecks: {
        used: flashcardDecks.filter((d) => d.userId === userId).length,
        limit: paid ? null : FREE_LIMITS.flashcardDecksPerDocument,
      },
      quizDecks: {
        used: quizDecks.filter((d) => d.userId === userId).length,
        limit: paid ? null : FREE_LIMITS.quizDecksPerDocument,
      },
      studyGuides: {
        used: studyGuideRunsUsed,
        limit: paid ? null : FREE_LIMITS.studyGuideSetsPerDocument,
      },
    };
  },
});
