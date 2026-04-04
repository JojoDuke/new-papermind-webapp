import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { flashcardWorkflow } from "../../../../../backend/mastra/workflows/flashcard-workflow";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  convex.setAuth(token);

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: {
    documentId: string;
    pageRangeStart: number;
    pageRangeEnd: number;
    cardCountPreset: "low" | "medium" | "high";
    includeTermDef: boolean;
    includeQa: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { documentId, pageRangeStart, pageRangeEnd, cardCountPreset, includeTermDef, includeQa } = body;
  if (!documentId || !pageRangeStart || !pageRangeEnd || !cardCountPreset) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // ── Fetch PDF URL from Convex ────────────────────────────────────────────────
  const docId = documentId as Id<"documents">;
  const pdfUrl = await convex.query(api.documents.getDocumentUrl, { documentId: docId });
  if (!pdfUrl) {
    return NextResponse.json({ error: "Could not retrieve PDF URL" }, { status: 404 });
  }

  // ── Run the Mastra workflow ──────────────────────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured on the server." },
      { status: 503 }
    );
  }

  let cards: { front: string; back: string }[];
  try {
    const run = await flashcardWorkflow.createRun();
    const result = await run.start({
      inputData: {
        pdfUrl,
        pageRangeStart,
        pageRangeEnd,
        cardCountPreset,
        includeTermDef,
        includeQa,
      },
    });

    if (result.status !== "success") {
      const errMsg = result.status === "failed"
        ? (result as { error?: { message?: string } }).error?.message ?? "Workflow failed"
        : `Workflow ended with status: ${result.status}`;
      throw new Error(errMsg);
    }
    cards = (result.result as { cards: { front: string; back: string }[] }).cards;
  } catch (err) {
    console.error("[generate flashcards] workflow error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Workflow failed" },
      { status: 500 }
    );
  }

  // ── Save to Convex ───────────────────────────────────────────────────────────
  try {
    const { deckId } = await convex.mutation(api.flashcards.saveAIGeneratedDeck, {
      documentId: docId,
      pageRangeStart,
      pageRangeEnd,
      cardCountPreset,
      includeTermDef,
      includeQa,
      cards,
    });
    return NextResponse.json({ deckId });
  } catch (err) {
    console.error("[generate flashcards] save error:", err);
    return NextResponse.json({ error: "Failed to save deck" }, { status: 500 });
  }
}
