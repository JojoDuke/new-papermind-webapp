import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveStudyGuides = mutation({
  args: {
    documentId: v.id("documents"),
    guides: v.array(
      v.object({
        title: v.string(),
        topic: v.string(),
        content: v.string(),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");

    const ids: string[] = [];
    for (const guide of args.guides) {
      const id = await ctx.db.insert("studyGuides", {
        userId,
        documentId: args.documentId,
        title: guide.title.trim(),
        topic: guide.topic.trim(),
        content: guide.content.trim(),
        order: guide.order,
        createdAt: Date.now(),
      });
      ids.push(id);
    }

    return { ids };
  },
});

export const listByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const guides = await ctx.db
      .query("studyGuides")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    return guides
      .filter((g) => g.userId === userId)
      .sort((a, b) => a.order - b.order);
  },
});

export const countByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const guides = await ctx.db
      .query("studyGuides")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();

    return guides.filter((g) => g.userId === userId).length;
  },
});

export const listMyStudyGuides = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const guides = await ctx.db
      .query("studyGuides")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    guides.sort((a, b) => b.createdAt - a.createdAt);

    const result = [];
    for (const guide of guides) {
      const doc = await ctx.db.get(guide.documentId);
      result.push({
        _id: guide._id,
        title: guide.title,
        topic: guide.topic,
        content: guide.content,
        order: guide.order,
        createdAt: guide.createdAt,
        documentId: guide.documentId,
        documentName: doc?.name ?? "Document",
      });
    }

    return result;
  },
});

export const getStudyGuide = query({
  args: { guideId: v.id("studyGuides") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const guide = await ctx.db.get(args.guideId);
    if (!guide || guide.userId !== userId) return null;

    const doc = await ctx.db.get(guide.documentId);
    return { ...guide, documentName: doc?.name ?? "Document" };
  },
});

export const deleteStudyGuide = mutation({
  args: { guideId: v.id("studyGuides") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const guide = await ctx.db.get(args.guideId);
    if (!guide || guide.userId !== userId) throw new Error("Guide not found");

    await ctx.db.delete(args.guideId);
  },
});

export const updateStudyGuide = mutation({
  args: {
    guideId: v.id("studyGuides"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const guide = await ctx.db.get(args.guideId);
    if (!guide || guide.userId !== userId) throw new Error("Guide not found");

    const patch: Record<string, string> = {};
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.content !== undefined) patch.content = args.content.trim();

    await ctx.db.patch(args.guideId, patch);
  },
});
