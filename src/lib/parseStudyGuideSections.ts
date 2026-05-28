export type StudyGuideTab = 'overview' | 'keyConcepts' | 'examples' | 'summary';

export type ParsedStudyGuide = {
  sections: Record<string, string>;
  overview: string;
  keyConcepts: string;
  examples: string;
  summary: string;
  keyFormula: { formula: string; legend: string } | null;
  keyTakeaways: string[];
};

function normalizeHeading(heading: string): string {
  return heading.trim().toLowerCase();
}

/** Split markdown content into sections keyed by ## heading (case-insensitive). */
export function parseStudyGuideSections(content: string): ParsedStudyGuide {
  const sections: Record<string, string> = {};

  const parts = content.split(/^## /gm);
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const newlineIdx = trimmed.indexOf('\n');
    const heading =
      newlineIdx === -1 ? trimmed : trimmed.slice(0, newlineIdx).trim();
    const body =
      newlineIdx === -1 ? '' : trimmed.slice(newlineIdx + 1).trim();
    sections[normalizeHeading(heading)] = body;
  }

  const get = (...names: string[]) => {
    for (const name of names) {
      const body = sections[normalizeHeading(name)];
      if (body) return body;
    }
    return '';
  };

  const overview = get('Overview');
  const keyConcepts = get('Key Concepts');
  const examples = [get('Examples'), get('Core Principles'), get('Important Details')]
    .filter(Boolean)
    .join('\n\n');
  const summary = get('Summary');

  const keyFormula =
    extractKeyFormula(get('Key Formula') || get('Formula')) ??
    extractKeyFormula(get('Important Details'));
  const keyTakeaways = extractBullets(summary || overview).slice(0, 6);

  return {
    sections,
    overview,
    keyConcepts,
    examples,
    summary,
    keyFormula,
    keyTakeaways,
  };
}

function extractBullets(markdown: string): string[] {
  return markdown
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^[-*] /.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').replace(/\*\*([^*]+)\*\*/g, '$1'));
}

function extractKeyFormula(
  text: string
): { formula: string; legend: string } | null {
  if (!text.trim()) return null;

  const lines = text.split('\n').map((l) => l.trim());
  const formulaLine = lines.find(
    (l) =>
      l.includes('=') &&
      (l.includes('$') ||
        /[Rβα]|\\beta|_\{|_\w/.test(l) ||
        (l.length < 120 && /^[A-Za-z0-9_\\{}^+\-().\s=]+$/.test(l.replace(/\$/g, ''))))
  );

  if (!formulaLine) return null;

  const formula = formulaLine.replace(/\$/g, '').trim();
  const formulaIdx = lines.indexOf(formulaLine);
  const legendLines = lines.slice(formulaIdx + 1).join('\n');
  const whereIdx = legendLines.toLowerCase().indexOf('where');
  const legend =
    whereIdx >= 0
      ? legendLines.slice(whereIdx).replace(/^where:?\s*/i, '').trim()
      : legendLines.trim();

  return { formula, legend: legend || '' };
}
