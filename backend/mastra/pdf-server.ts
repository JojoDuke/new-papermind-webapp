import { CanvasFactory, getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import { applyPdfJsPolyfills } from "./pdf-polyfills";

let workerReady = false;

/**
 * Configure pdfjs for Node + Vercel serverless.
 * Uses getData() so the worker is inlined — no dependency on pdf.worker.mjs paths under /var/task.
 */
export function ensurePdfParseWorker(): void {
  if (workerReady) return;
  applyPdfJsPolyfills();
  PDFParse.setWorker(getData());
  workerReady = true;
}

export function createPdfParser(data: Buffer): PDFParse {
  ensurePdfParseWorker();
  return new PDFParse({ data, CanvasFactory });
}
