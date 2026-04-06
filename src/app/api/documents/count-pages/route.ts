import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  convex.setAuth(token);

  let documentId: string;
  try {
    ({ documentId } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!documentId) return NextResponse.json({ error: "Missing documentId" }, { status: 400 });

  const docId = documentId as Id<"documents">;
  const pdfUrl = await convex.query(api.documents.getDocumentUrl, { documentId: docId });
  if (!pdfUrl) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const response = await fetch(pdfUrl);
  if (!response.ok) {
    return NextResponse.json({ error: "Failed to download PDF" }, { status: 502 });
  }
  const buffer = Buffer.from(await response.arrayBuffer());

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  let pageCount = 0;
  try {
    const info = await parser.getInfo();
    pageCount = info.total;
  } finally {
    await parser.destroy();
  }

  await convex.mutation(api.documents.updateDocumentPageCount, { documentId: docId, pageCount });
  return NextResponse.json({ pageCount });
}
