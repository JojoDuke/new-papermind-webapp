import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  convex.setAuth(token);

  let body: { guideId: string; messages: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { guideId, messages } = body;
  if (!guideId || !messages?.length) {
    return NextResponse.json({ error: "Missing guideId or messages" }, { status: 400 });
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.role !== "user" || !lastMessage.content.trim()) {
    return NextResponse.json({ error: "Last message must be a non-empty user message" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Anthropic API key is not configured." }, { status: 503 });
  }

  const guide = await convex.query(api.studyGuides.getStudyGuide, {
    guideId: guideId as Id<"studyGuides">,
  });
  if (!guide) {
    return NextResponse.json({ error: "Study guide not found" }, { status: 404 });
  }

  const history = messages.slice(-12).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content.trim(),
  }));

  try {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system: `You are Paige, a friendly and encouraging study tutor for Papermind (a pink fox mascot).
The student is reading a study guide and wants help understanding it better.

Rules:
- Answer only using the study guide content and reasonable academic knowledge that supports it
- Be clear, concise, and conversational — no walls of text unless asked
- Use examples and analogies when they help
- If asked something outside the guide, gently relate back to the topic or say what the guide covers
- Never invent specific facts, citations, or exam answers not supported by the guide
- Format with short paragraphs; use bullet points for lists when helpful

Study guide title: ${guide.title}
Source document: ${guide.documentName}

Full study guide content:
${guide.content}`,
      messages: history,
    });

    return NextResponse.json({ message: text.trim() });
  } catch (err) {
    console.error("[study-guide chat] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get a response" },
      { status: 500 }
    );
  }
}
