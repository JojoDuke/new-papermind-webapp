import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { studyGuideAuthorAgent, studyGuideSchema } from "../agents/study-guide-author";
import { groupChunksIntoBatches } from "../chunk-text";
import { applyPdfJsPolyfills } from "../pdf-polyfills";

const MAX_TEXT_CHARS = 40_000;

// ─── Step 1 – Extract full PDF text ──────────────────────────────────────────

const extractPdfStep = createStep({
  id: "extract-pdf-text-full",
  description: "Download a PDF and extract all text (capped for LLM context)",
  inputSchema: z.object({
    pdfUrl: z.string().url(),
    documentName: z.string(),
    guideCount: z.number().int().min(1).max(5).default(3),
  }),
  outputSchema: z.object({
    text: z.string(),
    documentName: z.string(),
    guideCount: z.number(),
  }),
  execute: async ({ inputData }) => {
    const { pdfUrl, documentName, guideCount } = inputData;

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    applyPdfJsPolyfills();
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });

    let text = "";
    try {
      const textResult = await parser.getText({});
      text = textResult.text.trim();
    } finally {
      await parser.destroy();
    }

    if (!text) {
      throw new Error("No text found in the PDF. It may be image-based.");
    }

    // Cap text to keep LLM prompts manageable
    if (text.length > MAX_TEXT_CHARS) {
      text = text.slice(0, MAX_TEXT_CHARS);
    }

    return { text, documentName, guideCount };
  },
});

// ─── Step 2 – Generate study guides via the AI agent ─────────────────────────

const generateGuidesStep = createStep({
  id: "generate-study-guides",
  description: "Generate structured study guides from the extracted text",
  inputSchema: z.object({
    text: z.string(),
    documentName: z.string(),
    guideCount: z.number(),
  }),
  outputSchema: studyGuideSchema,
  execute: async ({ inputData }) => {
    const { text, documentName, guideCount } = inputData;

    // Chunk text to get a manageable overview for the LLM
    const { MDocument } = await import("@mastra/rag");
    const doc = MDocument.fromText(text, { source: "pdf-full" });
    const ragChunks = await doc.chunk({
      strategy: "recursive",
      maxSize: 1024,
      overlap: 100,
      separators: ["\n\n", "\n", " "],
    });

    let chunkTexts = ragChunks.map((c) => c.text.trim()).filter(Boolean);
    if (chunkTexts.length === 0) chunkTexts = [text];

    // Use a single large batch for study guides (we need broad context)
    const batches = groupChunksIntoBatches(chunkTexts, MAX_TEXT_CHARS);
    const passage = batches[0] ?? text;

    const prompt = `
You are creating ${guideCount} comprehensive study guides for a document titled "${documentName}".

Identify the ${guideCount} most important and distinct topics from the document, then write a
full structured study guide for each one following your instructions.

Return ONLY valid JSON matching the schema — no markdown fences, no commentary.

DOCUMENT TEXT:
${passage}
`.trim();

    const result = await studyGuideAuthorAgent.generate(prompt, {
      structuredOutput: { schema: studyGuideSchema },
    });

    const parsed = studyGuideSchema.safeParse(result.object);
    if (!parsed.success) {
      throw new Error(`Agent returned invalid structure: ${parsed.error.message}`);
    }

    const guides = parsed.data.guides.slice(0, guideCount);
    if (guides.length === 0) {
      throw new Error("Agent returned no study guides.");
    }

    return { guides };
  },
});

// ─── Workflow ─────────────────────────────────────────────────────────────────

export const studyGuideWorkflow = createWorkflow({
  id: "study-guide-generation",
  inputSchema: z.object({
    pdfUrl: z.string().url(),
    documentName: z.string(),
    guideCount: z.number().int().min(1).max(5).default(3),
  }),
  outputSchema: studyGuideSchema,
})
  .then(extractPdfStep)
  .then(generateGuidesStep)
  .commit();
