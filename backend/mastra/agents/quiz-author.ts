import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const quizSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string().describe("Clear multiple-choice question (≤ 25 words)"),
      correctAnswer: z.string().describe("The correct answer (≤ 40 words)"),
      distractor1: z.string().describe("Plausible wrong answer (≤ 40 words)"),
      distractor2: z.string().describe("Another plausible wrong answer (≤ 40 words)"),
    })
  ),
});

export type QuizDeckOutput = z.infer<typeof quizSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const quizAuthorAgent = new Agent({
  id: "quiz-author",
  name: "quiz-author",
  model: anthropic("claude-haiku-4-5-20251001") as any,
  instructions: `
You are an expert quiz author. Given a passage of text you produce clear multiple-choice
questions that test understanding (not trivial recall).

Rules:
- One concept per question
- Questions should be unambiguous with one clearly best answer
- Distractors must be plausible but clearly wrong to someone who read the material
- Never use "All of the above" or "None of the above"
- Match distractor length and style to the correct answer
- Avoid repeating the same topic across questions
`.trim(),
});
