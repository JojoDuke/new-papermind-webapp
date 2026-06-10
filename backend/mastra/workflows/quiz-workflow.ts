import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { quizAuthorAgent, quizSchema } from "../agents/quiz-author";
import {
  dedupeCardsByFront,
  distributeCardsAcrossBatches,
  groupChunksIntoBatches,
} from "../chunk-text";
import { applyPdfJsPolyfills } from "../pdf-polyfills";

const configSchema = z.object({
  questionCountPreset: z.enum(["low", "medium", "high"]),
});

const extractPdfStep = createStep({
  id: "extract-pdf-text-quiz",
  description: "Download a PDF and extract the text for the requested page range",
  inputSchema: z
    .object({
      pdfUrl: z.string().url(),
      pageRangeStart: z.number().int().min(1),
      pageRangeEnd: z.number().int().min(1),
    })
    .merge(configSchema),
  outputSchema: z
    .object({
      text: z.string(),
      pageCount: z.number(),
    })
    .merge(configSchema),
  execute: async ({ inputData }) => {
    const { pdfUrl, pageRangeStart, pageRangeEnd, questionCountPreset } = inputData;

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    applyPdfJsPolyfills();
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

    return { text, pageCount, questionCountPreset };
  },
});

const QUESTION_COUNTS = { low: 5, medium: 8, high: 12 } as const;
const MAX_BATCH_CHARS = 10_000;

const generateQuestionsStep = createStep({
  id: "generate-quiz-questions",
  description: "Chunk text and generate multiple-choice questions",
  inputSchema: z
    .object({
      text: z.string(),
      pageCount: z.number(),
    })
    .merge(configSchema),
  outputSchema: quizSchema,
  execute: async ({ inputData }) => {
    const { text, questionCountPreset } = inputData;
    const targetCount = QUESTION_COUNTS[questionCountPreset];

    const { MDocument } = await import("@mastra/rag");
    const doc = MDocument.fromText(text, { source: "pdf-page-range" });
    const ragChunks = await doc.chunk({
      strategy: "recursive",
      maxSize: 512,
      overlap: 50,
      separators: ["\n\n", "\n", " "],
    });

    let chunkTexts = ragChunks.map((c) => c.text.trim()).filter(Boolean);
    if (chunkTexts.length === 0) chunkTexts = [text.trim()];

    const batches = groupChunksIntoBatches(chunkTexts, MAX_BATCH_CHARS);
    if (batches.length === 0) {
      throw new Error("No text left to generate questions from after chunking.");
    }

    const lengths = batches.map((b) => b.length);
    const perBatch = distributeCardsAcrossBatches(targetCount, lengths);

    type QuizQ = {
      question: string;
      correctAnswer: string;
      distractor1: string;
      distractor2: string;
    };
    const merged: QuizQ[] = [];

    for (let i = 0; i < batches.length; i++) {
      const n = perBatch[i] ?? 0;
      if (n <= 0) continue;

      const passage = batches[i];
      const prompt = `
Generate exactly ${n} multiple-choice quiz questions from the following passage excerpt (batch ${i + 1} of ${batches.length}).
Each question must include a correct answer and exactly 2 distractors.
Cover distinct ideas from this excerpt only.
Return ONLY valid JSON matching the schema — no markdown, no commentary.

PASSAGE:
${passage}
`.trim();

      const result = await quizAuthorAgent.generate(prompt, {
        structuredOutput: { schema: quizSchema },
      });

      const parsed = quizSchema.safeParse(result.object);
      if (!parsed.success) {
        throw new Error(`Agent returned invalid quiz structure: ${parsed.error.message}`);
      }

      const batchQuestions = parsed.data.questions
        .map((q) => ({
          question: q.question.trim(),
          correctAnswer: q.correctAnswer.trim(),
          distractor1: q.distractor1.trim(),
          distractor2: q.distractor2.trim(),
        }))
        .filter(
          (q) =>
            q.question.length > 0 &&
            q.correctAnswer.length > 0 &&
            q.distractor1.length > 0 &&
            q.distractor2.length > 0
        )
        .slice(0, n);

      merged.push(...batchQuestions);
    }

    // Dedupe by question text (reuse front-dedupe helper)
    let questions = dedupeCardsByFront(
      merged.map((q) => ({ front: q.question, back: q.correctAnswer }))
    ).map((deduped, idx) => {
      const original = merged.find((q) => q.question === deduped.front) ?? merged[idx];
      return original;
    });
    questions = questions.slice(0, targetCount);

    if (questions.length === 0) {
      throw new Error("Agent returned no usable questions.");
    }

    return { questions };
  },
});

export const quizWorkflow = createWorkflow({
  id: "quiz-generation",
  inputSchema: z
    .object({
      pdfUrl: z.string().url(),
      pageRangeStart: z.number().int().min(1),
      pageRangeEnd: z.number().int().min(1),
    })
    .merge(configSchema),
  outputSchema: quizSchema,
})
  .then(extractPdfStep)
  .then(generateQuestionsStep)
  .commit();
