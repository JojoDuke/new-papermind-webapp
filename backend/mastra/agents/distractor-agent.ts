import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const distractorSchema = z.object({
  distractor1: z.string(),
  distractor2: z.string(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const distractorAgent = new Agent({
  id: "distractor-agent",
  name: "distractor-agent",
  model: anthropic("claude-haiku-4-5-20251001") as any,
  instructions: `
You are a quiz distractor generator. Given a flashcard question and its correct answer,
generate exactly 2 plausible-but-wrong alternative answers (distractors).

Rules:
- Each distractor must be clearly wrong but plausible enough to be a realistic multiple-choice option
- Match the style and approximate length of the correct answer
- Never use "None of the above" or "All of the above"
- Keep each distractor concise (≤ 20 words)
- Return ONLY valid JSON matching the schema — no markdown, no commentary
`.trim(),
});
