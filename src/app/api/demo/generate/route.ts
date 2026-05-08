import { NextRequest, NextResponse } from 'next/server';
import 'pdf-parse/worker';
import { flashcardAuthorAgent, flashcardSchema } from '../../../../../backend/mastra/agents/flashcard-author';
import {
  dedupeCardsByFront,
  distributeCardsAcrossBatches,
  groupChunksIntoBatches,
} from '../../../../../backend/mastra/chunk-text';

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_PAGES = 8;
const TARGET_CARDS = 6;
const MAX_BATCH_CHARS = 10_000;

const DEMO_COOKIE = 'papermind_demo_used';

function buildFallbackCards(text: string) {
  const lines = text
    .split(/\r?\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 50);

  const cards: { front: string; back: string }[] = [];

  for (const line of lines) {
    if (cards.length >= TARGET_CARDS) break;

    const colon = line.indexOf(':');
    if (colon > 0 && colon < 80) {
      const left = line.slice(0, colon).trim();
      const right = line.slice(colon + 1).trim();
      if (left && right) {
        cards.push({
          front: `What is ${left}?`,
          back: right,
        });
        continue;
      }
    }

    // Otherwise, turn a short line into a “key idea” card.
    const back = line.length > 300 ? `${line.slice(0, 297)}…` : line;
    const words = back.split(/\s+/).slice(0, 8).join(' ');
    cards.push({
      front: `Key idea: ${words}${back.split(/\s+/).length > 8 ? '…' : ''}`,
      back,
    });
  }

  return dedupeCardsByFront(cards).slice(0, TARGET_CARDS);
}

export async function POST(req: NextRequest) {
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY);

  if (req.cookies.get(DEMO_COOKIE)?.value === '1') {
    return NextResponse.json(
      { error: 'You have already used the free demo. Create an account to keep studying.' },
      { status: 403 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file || file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'A PDF file is required' }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: 'File must be under 10 MB' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let text = '';
  try {
    const { PDFParse } = await import('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText({ first: 1, last: MAX_PAGES });
    text = result.text.trim();
    await parser.destroy();
  } catch {
    return NextResponse.json({ error: 'Could not read the PDF. Make sure it contains selectable text.' }, { status: 422 });
  }

  if (!text) {
    return NextResponse.json({ error: 'No readable text found. The PDF may be image-based.' }, { status: 422 });
  }

  try {
    // If the deployment isn't configured with an LLM key, still let the demo run by
    // generating a small set of simple, deterministic cards from extracted text.
    if (!hasOpenAiKey) {
      const cards = buildFallbackCards(text);
      if (cards.length === 0) {
        return NextResponse.json({ error: 'Could not generate cards from this document.' }, { status: 422 });
      }

      const res = NextResponse.json({
        cards,
        warning: 'Demo is running in limited mode (AI key not configured).',
      });
      res.cookies.set(DEMO_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365 * 10,
        secure: process.env.NODE_ENV === 'production',
      });
      return res;
    }

    const { MDocument } = await import('@mastra/rag');
    const doc = MDocument.fromText(text, { source: 'demo-pdf' });
    const ragChunks = await doc.chunk({ strategy: 'recursive', maxSize: 512, overlap: 50, separators: ['\n\n', '\n', ' '] });
    let chunkTexts = ragChunks.map((c) => c.text.trim()).filter(Boolean);
    if (chunkTexts.length === 0) chunkTexts = [text];

    const batches = groupChunksIntoBatches(chunkTexts, MAX_BATCH_CHARS);
    const perBatch = distributeCardsAcrossBatches(TARGET_CARDS, batches.map((b) => b.length));
    const merged: { front: string; back: string }[] = [];

    for (let i = 0; i < batches.length; i++) {
      const n = perBatch[i] ?? 0;
      if (n <= 0) continue;
      const prompt = `Generate exactly ${n} flashcards (question-answer pairs) from the following passage. Return ONLY valid JSON matching the schema.\n\nPASSAGE:\n${batches[i]}`.trim();
      const result = await flashcardAuthorAgent.generate(prompt, { structuredOutput: { schema: flashcardSchema } });
      const parsed = flashcardSchema.safeParse(result.object);
      if (!parsed.success) continue;
      merged.push(...parsed.data.cards.map((c) => ({ front: c.front.trim(), back: c.back.trim() })).filter((c) => c.front && c.back).slice(0, n));
    }

    const cards = dedupeCardsByFront(merged).slice(0, TARGET_CARDS);
    if (cards.length === 0) {
      return NextResponse.json({ error: 'Could not generate cards from this document.' }, { status: 422 });
    }

    const res = NextResponse.json({ cards });
    res.cookies.set(DEMO_COOKIE, '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10,
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (err) {
    console.error('[demo generate] error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation failed' }, { status: 500 });
  }
}
