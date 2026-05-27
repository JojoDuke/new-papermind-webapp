import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveFlashcardSession = mutation({
  args: {
    deckId: v.id("flashcardDecks"),
    correctCount: v.number(),
    totalCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) throw new Error("Deck not found");

    const total = Math.max(1, args.totalCount);
    const scorePercent = Math.round((args.correctCount / total) * 100);
    const now = Date.now();

    const existing = await ctx.db
      .query("flashcardDeckProgress")
      .withIndex("by_user_deck", (q) => q.eq("userId", userId).eq("deckId", args.deckId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        cardsMastered: args.correctCount,
        totalCards: total,
        lastScorePercent: scorePercent,
        bestScorePercent: Math.max(existing.bestScorePercent, scorePercent),
        lastStudiedAt: now,
      });
    } else {
      await ctx.db.insert("flashcardDeckProgress", {
        userId,
        deckId: args.deckId,
        cardsMastered: args.correctCount,
        totalCards: total,
        lastScorePercent: scorePercent,
        bestScorePercent: scorePercent,
        lastStudiedAt: now,
      });
    }
  },
});

export const saveQuizSession = mutation({
  args: {
    deckId: v.id("quizDecks"),
    correctCount: v.number(),
    totalCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) throw new Error("Deck not found");

    const total = Math.max(1, args.totalCount);
    const scorePercent = Math.round((args.correctCount / total) * 100);
    const now = Date.now();

    const existing = await ctx.db
      .query("quizDeckProgress")
      .withIndex("by_user_deck", (q) => q.eq("userId", userId).eq("deckId", args.deckId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        questionsAnswered: total,
        totalQuestions: total,
        lastScorePercent: scorePercent,
        bestScorePercent: Math.max(existing.bestScorePercent, scorePercent),
        lastStudiedAt: now,
      });
    } else {
      await ctx.db.insert("quizDeckProgress", {
        userId,
        deckId: args.deckId,
        questionsAnswered: total,
        totalQuestions: total,
        lastScorePercent: scorePercent,
        bestScorePercent: scorePercent,
        lastStudiedAt: now,
      });
    }
  },
});

export const getFlashcardDeckProgress = query({
  args: { deckId: v.id("flashcardDecks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const progress = await ctx.db
      .query("flashcardDeckProgress")
      .withIndex("by_user_deck", (q) => q.eq("userId", userId).eq("deckId", args.deckId))
      .unique();

    if (!progress) return null;
    return {
      progress: progress.totalCards > 0 ? progress.cardsMastered / progress.totalCards : 0,
      lastScorePercent: progress.lastScorePercent,
      bestScorePercent: progress.bestScorePercent,
      lastStudiedAt: progress.lastStudiedAt,
    };
  },
});

export const getUserProgressSummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        overallProgress: 0,
        cardsMastered: 0,
        quizzesTaken: 0,
        continueStudying: [] as Array<{
          type: "flashcard" | "quiz";
          deckId: string;
          title: string;
          progress: number;
          lastStudiedAt: number;
        }>,
      };
    }

    const [flashProgress, quizProgress] = await Promise.all([
      ctx.db
        .query("flashcardDeckProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
      ctx.db
        .query("quizDeckProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect(),
    ]);

    let cardsMastered = 0;
    let flashScoreSum = 0;
    let flashScoreCount = 0;
    const continueItems: Array<{
      type: "flashcard" | "quiz";
      deckId: string;
      title: string;
      progress: number;
      lastStudiedAt: number;
    }> = [];

    for (const p of flashProgress) {
      cardsMastered += p.cardsMastered;
      flashScoreSum += p.bestScorePercent;
      flashScoreCount++;

      const deck = await ctx.db.get(p.deckId);
      if (!deck) continue;
      const progress = p.totalCards > 0 ? p.cardsMastered / p.totalCards : 0;
      continueItems.push({
        type: "flashcard",
        deckId: p.deckId,
        title: deck.deckName,
        progress,
        lastStudiedAt: p.lastStudiedAt,
      });
    }

    let quizzesTaken = quizProgress.length;
    let quizScoreSum = 0;
    for (const p of quizProgress) {
      quizScoreSum += p.bestScorePercent;
      const deck = await ctx.db.get(p.deckId);
      if (!deck) continue;
      const progress = p.totalQuestions > 0 ? p.lastScorePercent / 100 : 0;
      continueItems.push({
        type: "quiz",
        deckId: p.deckId,
        title: deck.deckName,
        progress,
        lastStudiedAt: p.lastStudiedAt,
      });
    }

    continueItems.sort((a, b) => b.lastStudiedAt - a.lastStudiedAt);

    const totalScoreCount = flashScoreCount + quizzesTaken;
    const overallProgress =
      totalScoreCount > 0
        ? Math.round((flashScoreSum + quizScoreSum) / totalScoreCount)
        : 0;

    return {
      overallProgress,
      cardsMastered,
      quizzesTaken,
      continueStudying: continueItems.slice(0, 4),
    };
  },
});
