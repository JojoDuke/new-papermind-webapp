import { Agent } from "@mastra/core/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export const studyGuideSchema = z.object({
  guides: z.array(
    z.object({
      title: z.string().describe("Short descriptive title for this study guide (≤ 10 words)"),
      topic: z.string().describe("The main topic or theme covered (≤ 6 words)"),
      content: z.string().describe("Full study guide in markdown format with ## section headers"),
    })
  ).min(1).max(5),
});

export type StudyGuideOutput = z.infer<typeof studyGuideSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const studyGuideAuthorAgent = new Agent({
  id: "study-guide-author",
  name: "study-guide-author",
  model: anthropic("claude-haiku-4-5-20251001") as any,
  instructions: `
You are an expert academic study guide author. Given a document's text, you identify the main
topics and produce clear, structured study guides in markdown.

STRUCTURE FOR EACH GUIDE:
Each guide must follow this exact markdown structure:

## Overview
2–3 sentence intro that gives context and importance of the topic.

## Key Concepts
- **Term or concept**: Brief, precise definition (1–2 sentences)
(include 4–7 key concepts)

## Key Formula
Include this section when the topic has a central formula. Put the formula on its own line, then:
**Where:**
- **Symbol**: definition (one line per variable)

## Examples
2–3 worked examples or applied scenarios showing how the concepts are used in practice.

## Summary
- 3–5 bullet takeaways a student should remember (use markdown list items)

QUALITY RULES:
- Each guide covers a DISTINCT topic — no overlap between guides
- Use plain academic language — clear, not overly simplified
- Do not include filler or padding
- Markdown only — no raw HTML
- Keep each guide substantive but readable (400–700 words of content)
`.trim(),
});
