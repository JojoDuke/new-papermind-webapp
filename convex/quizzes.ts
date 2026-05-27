import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const QUESTION_COUNTS = { low: 5, medium: 8, high: 12 } as const;

export const saveAIGeneratedQuiz = mutation({
  args: {
    documentId: v.id("documents"),
    deckName: v.string(),
    pageRangeStart: v.number(),
    pageRangeEnd: v.number(),
    questionCountPreset: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    questions: v.array(
      v.object({
        question: v.string(),
        correctAnswer: v.string(),
        distractor1: v.string(),
        distractor2: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");
    if (args.questions.length === 0) throw new Error("No questions provided");

    const deckId = await ctx.db.insert("quizDecks", {
      userId,
      documentId: args.documentId,
      deckName: args.deckName.trim(),
      pageRangeStart: args.pageRangeStart,
      pageRangeEnd: args.pageRangeEnd,
      questionCountPreset: args.questionCountPreset,
      createdAt: Date.now(),
    });

    for (let i = 0; i < args.questions.length; i++) {
      const q = args.questions[i];
      await ctx.db.insert("quizQuestions", {
        deckId,
        question: q.question.trim(),
        correctAnswer: q.correctAnswer.trim(),
        distractor1: q.distractor1.trim(),
        distractor2: q.distractor2.trim(),
        order: i,
      });
    }

    return { deckId };
  },
});

export const listMyQuizDecks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const decks = await ctx.db
      .query("quizDecks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    decks.sort((a, b) => b.createdAt - a.createdAt);

    const result = [];
    for (const deck of decks) {
      const doc = await ctx.db.get(deck.documentId);
      const questions = await ctx.db
        .query("quizQuestions")
        .withIndex("by_deck", (q) => q.eq("deckId", deck._id))
        .collect();

      const progress = await ctx.db
        .query("quizDeckProgress")
        .withIndex("by_user_deck", (q) => q.eq("userId", userId).eq("deckId", deck._id))
        .unique();

      result.push({
        _id: deck._id,
        createdAt: deck.createdAt,
        deckName: deck.deckName,
        documentName: doc?.name ?? "Document",
        questionCount: questions.length,
        progress:
          progress && progress.totalQuestions > 0
            ? progress.bestScorePercent / 100
            : 0,
        lastStudiedAt: progress?.lastStudiedAt,
      });
    }

    return result;
  },
});

export const renameQuizDeck = mutation({
  args: {
    deckId: v.id("quizDecks"),
    deckName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) throw new Error("Deck not found");

    const name = args.deckName.trim();
    if (!name) throw new Error("Deck name cannot be empty");

    await ctx.db.patch(args.deckId, { deckName: name });
  },
});

export const deleteQuizDeck = mutation({
  args: { deckId: v.id("quizDecks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) throw new Error("Deck not found");

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();
    for (const q of questions) await ctx.db.delete(q._id);

    const progress = await ctx.db
      .query("quizDeckProgress")
      .withIndex("by_user_deck", (q) => q.eq("userId", userId).eq("deckId", args.deckId))
      .unique();
    if (progress) await ctx.db.delete(progress._id);

    await ctx.db.delete(args.deckId);
  },
});

export const getQuizDeckWithQuestions = query({
  args: { deckId: v.id("quizDecks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) return null;

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();
    questions.sort((a, b) => a.order - b.order);

    const doc = await ctx.db.get(deck.documentId);

    return {
      deck,
      questions,
      deckName: deck.deckName,
      documentName: doc?.name ?? "Document",
    };
  },
});

export { QUESTION_COUNTS };
