import { NextRequest, NextResponse } from "next/server";
import { distractorAgent, distractorSchema } from "../../../../../backend/mastra/agents/distractor-agent";

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "Anthropic API key not configured" }, { status: 503 });
  }

  let body: { cards: { front: string; back: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.cards?.length) {
    return NextResponse.json({ error: "No cards provided" }, { status: 400 });
  }

  try {
    const results = await Promise.all(
      body.cards.map(async (card) => {
        const prompt = `Question: ${card.front}\nCorrect answer: ${card.back}`;
        const result = await distractorAgent.generate(prompt, {
          structuredOutput: { schema: distractorSchema },
        });
        const parsed = distractorSchema.safeParse(result.object);
        if (!parsed.success) {
          throw new Error(`Invalid distractor output for: ${card.front}`);
        }
        return {
          ...card,
          distractors: [parsed.data.distractor1, parsed.data.distractor2] as [string, string],
        };
      })
    );
    return NextResponse.json({ cards: results });
  } catch (err) {
    console.error("[generate distractors] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to generate distractors" },
      { status: 500 }
    );
  }
}
