import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const flashcardSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string().describe("The question or term (≤ 20 words)"),
      back: z.string().describe("The answer or definition (≤ 60 words)"),
    })
  ),
});

export type FlashcardDeck = z.infer<typeof flashcardSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const flashcardAuthorAgent = new Agent({
  id: "flashcard-author",
  name: "flashcard-author",
  model: anthropic("claude-haiku-4-5-20251001") as any,
  instructions: `
You are an expert study-card author. Given a passage of text you produce clear,
concise flashcards that follow these quality rules:

FRONT (question / term)
  • One clear concept per card — never two questions in one
  • Prefer "What is…?", "How does…?", "Define…" phrasing
  • ≤ 20 words

BACK (answer / definition)
  • Complete but minimal — remove filler words
  • One focused answer; do NOT dump the whole paragraph
  • ≤ 60 words

GENERAL
  • Avoid trivial factoids; prefer conceptual understanding
  • Do not repeat the same content across cards
  • If the passage is short, produce fewer, higher-quality cards rather than padding
`.trim(),
});
