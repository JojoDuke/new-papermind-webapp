import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listMyMockExamSessions = query({
  args: { examType: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return [];

    const sessions = await ctx.db
      .query("mockExamSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();

    const filtered = args.examType
      ? sessions.filter((s) => s.examType === args.examType)
      : sessions;

    return Promise.all(
      filtered.map(async (session) => {
        const doc = await ctx.db.get(session.documentId);
        return {
          ...session,
          documentName: doc?.name ?? "Unknown document",
        };
      })
    );
  },
});

export const getMockExamSession = query({
  args: { sessionId: v.id("mockExamSessions") },
  handler: async (ctx, args) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) return null;
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) return null;
    const doc = await ctx.db.get(session.documentId);
    return { ...session, documentName: doc?.name ?? "Unknown document" };
  },
});

export const saveGeneratedMockExam = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
    examType: v.string(),
    timeLimitMinutes: v.number(),
    questions: v.array(v.object({
      question: v.string(),
      correctAnswer: v.string(),
      distractor1: v.string(),
      distractor2: v.string(),
      distractor3: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");

    const sessionId = await ctx.db.insert("mockExamSessions", {
      userId,
      documentId: args.documentId,
      title: args.title,
      examType: args.examType,
      timeLimitMinutes: args.timeLimitMinutes,
      questions: args.questions,
      createdAt: Date.now(),
    });

    return { sessionId };
  },
});

export const startMockExamSession = mutation({
  args: { sessionId: v.id("mockExamSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");
    if (session.startedAt) return; // already started
    await ctx.db.patch(args.sessionId, { startedAt: Date.now() });
  },
});

export const submitMockExamAnswers = mutation({
  args: {
    sessionId: v.id("mockExamSessions"),
    answers: v.array(v.object({
      questionIndex: v.number(),
      selectedAnswer: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");

    const correct = args.answers.filter((a) => {
      const q = session.questions[a.questionIndex];
      return q && a.selectedAnswer === q.correctAnswer;
    }).length;

    const scorePercent = session.questions.length > 0
      ? Math.round((correct / session.questions.length) * 100)
      : 0;

    await ctx.db.patch(args.sessionId, {
      answers: args.answers,
      completedAt: Date.now(),
      scorePercent,
    });

    return { scorePercent, correct, total: session.questions.length };
  },
});

export const deleteMockExamSession = mutation({
  args: { sessionId: v.id("mockExamSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Session not found");
    await ctx.db.delete(args.sessionId);
  },
});
