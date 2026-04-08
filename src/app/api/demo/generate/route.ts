import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 503 });
  }

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
