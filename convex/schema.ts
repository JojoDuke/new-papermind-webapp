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
});