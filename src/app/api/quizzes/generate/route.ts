import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { quizWorkflow } from "../../../../../backend/mastra/workflows/quiz-workflow";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  convex.setAuth(token);

  let body: {
    documentId: string;
    deckName: string;
    pageRangeStart: number;
    pageRangeEnd: number;
    questionCountPreset: "low" | "medium" | "high";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { documentId, deckName, pageRangeStart, pageRangeEnd, questionCountPreset } = body;
  if (!documentId || !deckName?.trim() || !pageRangeStart || !pageRangeEnd || !questionCountPreset) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const docId = documentId as Id<"documents">;
  const pdfUrl = await convex.query(api.documents.getDocumentUrl, { documentId: docId });
  if (!pdfUrl) {
    return NextResponse.json({ error: "Could not retrieve PDF URL" }, { status: 404 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Anthropic API key is not configured on the server." },
      { status: 503 }
    );
  }

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
        questionCountPreset,
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
    console.error("[generate quiz] workflow error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Workflow failed" },
      { status: 500 }
    );
  }

  try {
    const { deckId } = await convex.mutation(api.quizzes.saveAIGeneratedQuiz, {
      documentId: docId,
      deckName: deckName.trim(),
      pageRangeStart,
      pageRangeEnd,
      questionCountPreset,
      questions,
    });
    return NextResponse.json({ deckId });
  } catch (err) {
    console.error("[generate quiz] save error:", err);
    return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
  }
}
