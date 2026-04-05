import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { flashcardAuthorAgent, flashcardSchema } from "../agents/flashcard-author";
import {
  dedupeCardsByFront,
  distributeCardsAcrossBatches,
  groupChunksIntoBatches,
} from "../chunk-text";

// ─── Shared config schema (passed through the pipeline) ──────────────────────

const configSchema = z.object({
  cardCountPreset: z.enum(["low", "medium", "high"]),
  includeTermDef: z.boolean(),
  includeQa: z.boolean(),
});

// ─── Step 1 – Extract text from a PDF page range ─────────────────────────────

const extractPdfStep = createStep({
  id: "extract-pdf-text",
  description: "Download a PDF and extract the text for the requested page range",
  inputSchema: z.object({
    pdfUrl: z.string().url(),
    pageRangeStart: z.number().int().min(1),
    pageRangeEnd: z.number().int().min(1),
  }).merge(configSchema),
  outputSchema: z.object({
    text: z.string(),
    pageCount: z.number(),
  }).merge(configSchema),
  execute: async ({ inputData }) => {
    const { pdfUrl, pageRangeStart, pageRangeEnd, cardCountPreset, includeTermDef, includeQa } = inputData;

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    // pdf-parse v2+ exports the PDFParse class (no default function). Use
    // getText({ first, last }) for an inclusive page range — see ParseParameters.
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    let text = "";
    let pageCount = 0;
    try {
      const textResult = await parser.getText({
        first: pageRangeStart,
        last: pageRangeEnd,
      });
      text = textResult.text.trim();
      pageCount = textResult.total;
    } finally {
      await parser.destroy();
    }

    if (!text) {
      throw new Error(
        `No text found in pages ${pageRangeStart}–${pageRangeEnd}. ` +
          `The PDF may be image-based or those pages may be blank.`
      );
    }

    return { text, pageCount, cardCountPreset, includeTermDef, includeQa };
  },
});

// ─── Step 2 – Generate flashcards via the AI agent ───────────────────────────

const CARD_COUNTS = { low: 5, medium: 8, high: 12 } as const;

/** Keep each LLM prompt under this size so long page ranges stay reliable. */
const MAX_BATCH_CHARS = 10_000;

const generateCardsStep = createStep({
  id: "generate-cards",
  description: "Chunk text with MDocument, then generate flashcards per batch",
  inputSchema: z.object({
    text: z.string(),
    pageCount: z.number(),
  }).merge(configSchema),
  outputSchema: flashcardSchema,
  execute: async ({ inputData }) => {
    const { text, cardCountPreset, includeTermDef, includeQa } = inputData;
    const targetCount = CARD_COUNTS[cardCountPreset];

    const typeParts: string[] = [];
    if (includeTermDef) typeParts.push("term-definition pairs");
    if (includeQa) typeParts.push("question-answer pairs");
    const typesDescription = typeParts.length > 0 ? typeParts.join(" and ") : "question-answer pairs";

    // 1) Mastra RAG: split into manageable chunks (no embeddings / vector DB).
    const { MDocument } = await import("@mastra/rag");
    const doc = MDocument.fromText(text, { source: "pdf-page-range" });
    const ragChunks = await doc.chunk({
      strategy: "recursive",
      maxSize: 512,
      overlap: 50,
      separators: ["\n\n", "\n", " "],
    });

    let chunkTexts = ragChunks.map((c) => c.text.trim()).filter(Boolean);
    if (chunkTexts.length === 0) {
      chunkTexts = [text.trim()];
    }

    const batches = groupChunksIntoBatches(chunkTexts, MAX_BATCH_CHARS);
    if (batches.length === 0) {
      throw new Error("No text left to generate cards from after chunking.");
    }

    const lengths = batches.map((b) => b.length);
    const perBatch = distributeCardsAcrossBatches(targetCount, lengths);

    const merged: { front: string; back: string }[] = [];

    for (let i = 0; i < batches.length; i++) {
      const n = perBatch[i] ?? 0;
      if (n <= 0) continue;

      const passage = batches[i];
      const prompt = `
Generate exactly ${n} flashcards (${typesDescription}) from the following passage excerpt (batch ${i + 1} of ${batches.length}).
Cover distinct ideas from this excerpt only; do not repeat cards you would make for other excerpts.
Return ONLY valid JSON that matches the schema — no markdown, no commentary.

PASSAGE:
${passage}
`.trim();

      const result = await flashcardAuthorAgent.generate(prompt, {
        structuredOutput: { schema: flashcardSchema },
      });

      const parsed = flashcardSchema.safeParse(result.object);
      if (!parsed.success) {
        throw new Error(`Agent returned invalid card structure: ${parsed.error.message}`);
      }

      const batchCards = parsed.data.cards
        .map((card) => ({ front: card.front.trim(), back: card.back.trim() }))
        .filter((card) => card.front.length > 0 && card.back.length > 0)
        .slice(0, n);

      merged.push(...batchCards);
    }

    let cards = dedupeCardsByFront(merged);
    cards = cards.slice(0, targetCount);

    if (cards.length === 0) {
      throw new Error("Agent returned no usable cards.");
    }

    return { cards };
  },
});

// ─── Workflow ─────────────────────────────────────────────────────────────────

export const flashcardWorkflow = createWorkflow({
  id: "flashcard-generation",
  inputSchema: z.object({
    pdfUrl: z.string().url(),
    pageRangeStart: z.number().int().min(1),
    pageRangeEnd: z.number().int().min(1),
  }).merge(configSchema),
  outputSchema: flashcardSchema,
})
  .then(extractPdfStep)
  .then(generateCardsStep)
  .commit();
