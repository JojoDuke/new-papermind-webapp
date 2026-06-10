import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { quizWorkflow } from "../../../../../backend/mastra/workflows/quiz-workflow";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  convex.setAuth(token);

  let body: {
    documentId: string;
    title: string;
    examType: string;
    pageRangeStart: number;
    pageRangeEnd: number;
    timeLimitMinutes: number;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { documentId, title, examType, pageRangeStart, pageRangeEnd, timeLimitMinutes } = body;
  if (!documentId || !title?.trim() || !examType || !pageRangeStart || !pageRangeEnd) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const docId = documentId as Id<"documents">;
  const pdfUrl = await convex.query(api.documents.getDocumentUrl, { documentId: docId });
  if (!pdfUrl) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Anthropic API key is not configured." }, { status: 503 });
  }

  // Reuse quiz workflow with "high" preset to get more questions for exam mode
  let questions: {
    question: string;
    correctAnswer: string;
    distractor1: string;
    distractor2: string;
  }[];

  try {
    const run = await quizWorkflow.createRun();
    const result = await run.start({
      inputData: {
        pdfUrl,
        pageRangeStart,
        pageRangeEnd,
        questionCountPreset: "high",
      },
    });

    if (result.status !== "success") {
      const errMsg =
        result.status === "failed"
          ? (result as { error?: { message?: string } }).error?.message ?? "Workflow failed"
          : `Workflow ended with status: ${result.status}`;
      throw new Error(errMsg);
    }

    questions = (
      result.result as {
        questions: {
          question: string;
          correctAnswer: string;
          distractor1: string;
          distractor2: string;
        }[];
      }
    ).questions;
  } catch (err) {
    console.error("[generate mock exam] workflow error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Workflow failed" }, { status: 500 });
  }

  try {
    const { sessionId } = await convex.mutation(api.mockExams.saveGeneratedMockExam, {
      documentId: docId,
      title: title.trim(),
      examType,
      timeLimitMinutes: timeLimitMinutes ?? 90,
      questions,
    });
    return NextResponse.json({ sessionId });
  } catch (err) {
    console.error("[generate mock exam] save error:", err);
    return NextResponse.json({ error: "Failed to save mock exam" }, { status: 500 });
  }
}
