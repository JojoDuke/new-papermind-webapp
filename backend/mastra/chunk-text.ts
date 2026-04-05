/** Group RAG text chunks into prompt-sized batches (no embeddings / retrieval). */

const SEP = "\n\n---\n\n";

export function groupChunksIntoBatches(texts: string[], maxChars: number): string[] {
  const trimmed = texts.map((t) => t.trim()).filter(Boolean);
  if (trimmed.length === 0) return [];

  const batches: string[] = [];
  let current = "";

  const flush = () => {
    if (current) {
      batches.push(current);
      current = "";
    }
  };

  for (const t of trimmed) {
    const sep = current ? SEP : "";
    if (current.length + sep.length + t.length <= maxChars) {
      current += sep + t;
      continue;
    }
    flush();
    if (t.length <= maxChars) {
      current = t;
    } else {
      for (let i = 0; i < t.length; i += maxChars) {
        batches.push(t.slice(i, i + maxChars));
      }
    }
  }
  flush();
  return batches;
}

/** Split `targetCount` across batches proportionally by character length (largest remainder). */
export function distributeCardsAcrossBatches(targetCount: number, batchLengths: number[]): number[] {
  const total = batchLengths.reduce((a, b) => a + b, 0);
  if (total === 0 || targetCount <= 0) return batchLengths.map(() => 0);

  const raw = batchLengths.map((len) => (targetCount * len) / total);
  const floors = raw.map((r) => Math.floor(r));
  let diff = targetCount - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floors];
  for (let k = 0; k < diff; k++) {
    out[order[k].i]++;
  }
  return out;
}

export function dedupeCardsByFront(cards: { front: string; back: string }[]): { front: string; back: string }[] {
  const seen = new Set<string>();
  const out: { front: string; back: string }[] = [];
  for (const c of cards) {
    const key = c.front.toLowerCase().trim();
    if (key.length === 0 || seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}
