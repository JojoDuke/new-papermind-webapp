import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { flashcardAuthorAgent, flashcardSchema } from "../agents/flashcard-author";

type PdfParseResult = { numpages: number; text: string };
type PdfParseFn = (buf: Buffer, opts?: Record<string, unknown>) => Promise<PdfParseResult>;

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

    // Dynamic import handles CJS/ESM interop correctly in the Next.js server
    // runtime — a top-level require() gets mis-bundled by webpack.
    const pdfParseMod = await import("pdf-parse");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = ((pdfParseMod as any).default ?? pdfParseMod) as PdfParseFn;

    // pdf-parse processes pages sequentially (1 → N), so a simple counter
    // is the only reliable way to identify page numbers — the pdfjs page
    // object exposed to pagerender has no public pageIndex/pageNumber field
    // that is stable across pdf-parse versions.
    const pagesInRange: string[] = [];
    let pageCounter = 0;

    const parsed = await pdfParse(buffer, {
      pagerender: (pageData: {
        getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
      }) => {
        pageCounter++;
        const currentPage = pageCounter;
        if (currentPage >= pageRangeStart && currentPage <= pageRangeEnd) {
          return pageData.getTextContent().then((content) => {
            const pageText = content.items.map((item) => item.str).join(" ");
            pagesInRange.push(pageText);
            return pageText;
          });
        }
        // Return empty string for pages outside the range so pdf-parse
        // doesn't accumulate their text in parsed.text either.
        return Promise.resolve("");
      },
    });

    const text = pagesInRange.join("\n\n").trim();
    if (!text) {
      throw new Error(
        `No text found in pages ${pageRangeStart}–${pageRangeEnd}. ` +
          `The PDF may be image-based or those pages may be blank.`
      );
    }

    return { text, pageCount: parsed.numpages, cardCountPreset, includeTermDef, includeQa };
  },
});

// ─── Step 2 – Generate flashcards via the AI agent ───────────────────────────

const CARD_COUNTS = { low: 5, medium: 8, high: 12 } as const;

const generateCardsStep = createStep({
  id: "generate-cards",
  description: "Use the flashcard-author agent to turn extracted text into cards",
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

    const prompt = `
Generate exactly ${targetCount} flashcards (${typesDescription}) from the following passage.
Return ONLY valid JSON that matches the schema — no markdown, no commentary.

PASSAGE:
${text}
`.trim();

    const result = await flashcardAuthorAgent.generate(prompt, {
      structuredOutput: { schema: flashcardSchema },
    });

    const parsed = flashcardSchema.safeParse(result.object);
    if (!parsed.success) {
      throw new Error(`Agent returned invalid card structure: ${parsed.error.message}`);
    }

    const cards = parsed.data.cards
      .map((card) => ({ front: card.front.trim(), back: card.back.trim() }))
      .filter((card) => card.front.length > 0 && card.back.length > 0);

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
