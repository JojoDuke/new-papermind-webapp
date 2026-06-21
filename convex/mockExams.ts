import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { auth } from "./auth";
import { getAuthUserId } from "@convex-dev/auth/server";
import { FREE_LIMITS } from "./usageQuota";
import { isPaidUser } from "./lib/isPaidUser";
import {
  MOCK_EXAM_QUESTIONS_PER_SESSION,
  NCLEX_RN_BANK_QUESTIONS,
} from "./lib/mockExamBankSeed";

const mockExamQuestionShape = v.object({
  question: v.string(),
  correctAnswer: v.string(),
  distractor1: v.string(),
  distractor2: v.string(),
  distractor3: v.optional(v.string()),
});

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function ensureExamBankSeeded(ctx: MutationCtx, examType: string) {
  const existing = await ctx.db
    .query("mockExamQuestionBank")
    .withIndex("by_exam_type", (q) => q.eq("examType", examType))
    .first();

  if (existing) return;

  if (examType !== "nclex-rn") return;

  for (const item of NCLEX_RN_BANK_QUESTIONS) {
    await ctx.db.insert("mockExamQuestionBank", {
      examType,
      question: item.question,
      correctAnswer: item.correctAnswer,
      distractor1: item.distractor1,
      distractor2: item.distractor2,
      distractor3: item.distractor3,
      topic: item.topic,
    });
  }
}

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
        const doc = session.documentId ? await ctx.db.get(session.documentId) : null;
        return {
          ...session,
          documentName: doc?.name ?? "Papermind Question Bank",
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
    const doc = session.documentId ? await ctx.db.get(session.documentId) : null;
    return { ...session, documentName: doc?.name ?? "Papermind Question Bank" };
  },
});

export const createMockExamFromBank = mutation({
  args: {
    examType: v.string(),
    timeLimitMinutes: v.optional(v.number()),
  },
  returns: v.object({ sessionId: v.id("mockExamSessions") }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const isPaid = await isPaidUser(ctx, userId);

    if (!isPaid) {
      const allExams = await ctx.db
        .query("mockExamSessions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      if (allExams.length >= FREE_LIMITS.mockExamsTotal) {
        throw new Error(
          `upgrade_required: Free accounts get ${FREE_LIMITS.mockExamsTotal} mock exam preview. Upgrade to generate more.`
        );
      }
    }

    await ensureExamBankSeeded(ctx, args.examType);

    const bankQuestions = await ctx.db
      .query("mockExamQuestionBank")
      .withIndex("by_exam_type", (q) => q.eq("examType", args.examType))
      .collect();

    if (bankQuestions.length === 0) {
      throw new Error("No questions available for this exam type yet.");
    }

    const count = Math.min(MOCK_EXAM_QUESTIONS_PER_SESSION, bankQuestions.length);
    const selected = shuffle(bankQuestions).slice(0, count).map((q) => ({
      question: q.question,
      correctAnswer: q.correctAnswer,
      distractor1: q.distractor1,
      distractor2: q.distractor2,
      distractor3: q.distractor3,
    }));

    const priorCount = (
      await ctx.db
        .query("mockExamSessions")
        .withIndex("by_user_exam_type", (q) =>
          q.eq("userId", userId).eq("examType", args.examType)
        )
        .collect()
    ).length;

    const title =
      args.examType === "nclex-rn"
        ? `NCLEX-RN Mock Exam ${priorCount + 1}`
        : `Mock Exam ${priorCount + 1}`;

    const sessionId = await ctx.db.insert("mockExamSessions", {
      userId,
      title,
      examType: args.examType,
      timeLimitMinutes: args.timeLimitMinutes ?? 90,
      questions: selected,
      createdAt: Date.now(),
    });

    return { sessionId };
  },
});

/** @deprecated Document-based generation. Mock exams now use the Papermind question bank. */
export const saveGeneratedMockExam = mutation({
  args: {
    documentId: v.id("documents"),
    title: v.string(),
    examType: v.string(),
    timeLimitMinutes: v.number(),
    questions: v.array(mockExamQuestionShape),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const doc = await ctx.db.get(args.documentId);
    if (!doc || doc.userId !== userId) throw new Error("Document not found");

    const isPaid = await isPaidUser(ctx, userId);

    if (!isPaid) {
      const allExams = await ctx.db
        .query("mockExamSessions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();
      if (allExams.length >= FREE_LIMITS.mockExamsTotal) {
        throw new Error(
          `upgrade_required: Free accounts get ${FREE_LIMITS.mockExamsTotal} mock exam preview. Upgrade to generate more.`
        );
      }
    }

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
    if (session.startedAt) return;
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
