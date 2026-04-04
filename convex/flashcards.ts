import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const CARD_COUNTS = { low: 5, medium: 8, high: 12 } as const;

export const generateStubDeck = mutation({
  args: {
    documentId: v.id("documents"),
    pageRangeStart: v.number(),
    pageRangeEnd: v.number(),
    cardCount: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    includeTermDef: v.boolean(),
    includeQa: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");

    if (args.pageRangeStart < 1 || args.pageRangeEnd < 1) {
      throw new Error("Page numbers must be at least 1");
    }
    if (args.pageRangeStart > args.pageRangeEnd) {
      throw new Error("First page cannot be after last page");
    }

    const types: Array<"term" | "qa"> = [];
    if (args.includeTermDef) types.push("term");
    if (args.includeQa) types.push("qa");
    if (types.length === 0) {
      types.push("term", "qa");
    }

    const n = CARD_COUNTS[args.cardCount];
    const rangeLabel = `${args.pageRangeStart}–${args.pageRangeEnd}`;

    const deckId = await ctx.db.insert("flashcardDecks", {
      userId,
      documentId: args.documentId,
      pageRangeStart: args.pageRangeStart,
      pageRangeEnd: args.pageRangeEnd,
      cardCountPreset: args.cardCount,
      createdAt: Date.now(),
    });

    for (let i = 0; i < n; i++) {
      const kind = types[i % types.length];
      let front: string;
      let back: string;

      if (kind === "term") {
        if (i === 0) {
          front = "pūngāwerewere";
          back = "Spider (Māori). Placeholder card — real terms will come from your PDF.";
        } else {
          front = `Key term ${i + 1} (pp. ${rangeLabel})`;
          back = `Definition for this term from pages ${rangeLabel}. Placeholder until content extraction is enabled.`;
        }
      } else {
        front = `What concept from pages ${rangeLabel} is illustrated by example ${i + 1}?`;
        back = `Answer ${i + 1} for the selected range. Placeholder until generation is wired to the document text.`;
      }

      await ctx.db.insert("flashcards", {
        deckId,
        front,
        back,
        order: i,
        isNew: i === 0,
      });
    }

    return { deckId };
  },
});

export const saveAIGeneratedDeck = mutation({
  args: {
    documentId: v.id("documents"),
    pageRangeStart: v.number(),
    pageRangeEnd: v.number(),
    cardCountPreset: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    includeTermDef: v.boolean(),
    includeQa: v.boolean(),
    cards: v.array(
      v.object({
        front: v.string(),
        back: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");

    if (args.cards.length === 0) throw new Error("No cards provided");

    const deckId = await ctx.db.insert("flashcardDecks", {
      userId,
      documentId: args.documentId,
      pageRangeStart: args.pageRangeStart,
      pageRangeEnd: args.pageRangeEnd,
      cardCountPreset: args.cardCountPreset,
      createdAt: Date.now(),
    });

    for (let i = 0; i < args.cards.length; i++) {
      const card = args.cards[i];
      await ctx.db.insert("flashcards", {
        deckId,
        front: card.front.trim(),
        back: card.back.trim(),
        order: i,
        isNew: i === 0,
      });
    }

    return { deckId };
  },
});

export const listMyFlashcardDecks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const decks = await ctx.db
      .query("flashcardDecks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    decks.sort((a, b) => b.createdAt - a.createdAt);

    const result = [];
    for (const deck of decks) {
      const doc = await ctx.db.get(deck.documentId);
      const cards = await ctx.db
        .query("flashcards")
        .withIndex("by_deck", (q) => q.eq("deckId", deck._id))
        .collect();

      result.push({
        _id: deck._id,
        createdAt: deck.createdAt,
        pageRangeStart: deck.pageRangeStart,
        pageRangeEnd: deck.pageRangeEnd,
        documentName: doc?.name ?? "Document",
        cardCount: cards.length,
      });
    }

    return result;
  },
});

export const getDeckWithCards = query({
  args: {
    deckId: v.id("flashcardDecks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const deck = await ctx.db.get(args.deckId);
    if (!deck || deck.userId !== userId) return null;

    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    cards.sort((a, b) => a.order - b.order);

    const doc = await ctx.db.get(deck.documentId);

    return {
      deck,
      cards,
      documentName: doc?.name ?? "Document",
    };
  },
});
