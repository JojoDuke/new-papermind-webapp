import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { studyGuideWorkflow } from "../../../../../backend/mastra/workflows/study-guide-workflow";

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
  let body: { documentId: string; guideCount?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { documentId, guideCount = 3 } = body;
  if (!documentId) {
    return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
  }

  // ── Fetch document info from Convex ─────────────────────────────────────────
  const docId = documentId as Id<"documents">;
  const [pdfUrl, doc, docQuota] = await Promise.all([
    convex.query(api.documents.getDocumentUrl, { documentId: docId }),
    convex.query(api.documents.getDocument, { documentId: docId }),
    convex.query(api.usageQuota.getDocumentQuota, { documentId: docId }),
  ]);

  if (!pdfUrl || !doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // ── Quota check ──────────────────────────────────────────────────────────────
  if (
    docQuota.studyGuides.limit !== null &&
    docQuota.studyGuides.used >= docQuota.studyGuides.limit
  ) {
    return NextResponse.json(
      { error: "upgrade_required", message: "Free accounts can generate study guides once per document." },
      { status: 402 }
    );
  }

  // ── Check LLM key ────────────────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Anthropic API key is not configured." },
      { status: 503 }
    );
  }

  // ── Run the Mastra workflow ──────────────────────────────────────────────────
  let guides: { title: string; topic: string; content: string }[];
  try {
    const run = await studyGuideWorkflow.createRun();
    const result = await run.start({
      inputData: {
        pdfUrl,
        documentName: doc.name,
        guideCount,
      },
    });

    if (result.status !== "success") {
      const errMsg =
        result.status === "failed"
          ? (result as { error?: { message?: string } }).error?.message ?? "Workflow failed"
          : `Workflow ended with status: ${result.status}`;
      throw new Error(errMsg);
    }

    guides = (
      result.result as { guides: { title: string; topic: string; content: string }[] }
    ).guides;
  } catch (err) {
    console.error("[generate study guides] workflow error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Workflow failed" },
      { status: 500 }
    );
  }

  // ── Save to Convex ───────────────────────────────────────────────────────────
  try {
    await convex.mutation(api.studyGuides.saveStudyGuides, {
      documentId: docId,
      guides: guides.map((g, i) => ({ ...g, order: i })),
    });

    return NextResponse.json({ count: guides.length });
  } catch (err) {
    console.error("[generate study guides] save error:", err);
    return NextResponse.json({ error: "Failed to save study guides" }, { status: 500 });
  }
}
