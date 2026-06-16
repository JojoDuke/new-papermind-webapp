import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { FREE_LIMITS } from "./usageQuota";
import { isPaidUser } from "./lib/isPaidUser";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveDocument = mutation({
  args: {
    storageId: v.id("_storage"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const normalizedName = args.name.trim().toLowerCase();
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (existing.some((doc) => doc.name.trim().toLowerCase() === normalizedName)) {
      await ctx.storage.delete(args.storageId);
      throw new Error("This file is already in your documents.");
    }

    // Free tier: check document upload limit
    const isPaid = await isPaidUser(ctx, userId);

    if (!isPaid && existing.length >= FREE_LIMITS.documents) {
      await ctx.storage.delete(args.storageId);
      throw new Error(
        `upgrade_required: Free accounts can upload up to ${FREE_LIMITS.documents} documents. Upgrade to upload more.`
      );
    }

    return await ctx.db.insert("documents", {
      userId,
      name: args.name,
      storageId: args.storageId,
      uploadedAt: Date.now(),
    });
  },
});

export const updateDocumentPageCount = mutation({
  args: {
    documentId: v.id("documents"),
    pageCount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");

    await ctx.db.patch(args.documentId, { pageCount: args.pageCount });
  },
});

export const deleteDocument = mutation({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc) throw new Error("Document not found");
    if (doc.userId !== userId) throw new Error("Unauthorized");

    await ctx.storage.delete(doc.storageId);
    await ctx.db.delete(args.documentId);
  },
});

export const getDocument = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) return null;

    const url = await ctx.storage.getUrl(doc.storageId);
    return { ...doc, url };
  },
});

export const getDocumentUrl = query({
  args: {
    documentId: v.id("documents"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) return null;

    return await ctx.storage.getUrl(doc.storageId);
  },
});

export const listDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
