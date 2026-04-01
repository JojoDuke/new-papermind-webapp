'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInput, setPageInput] = useState('1');

  const renderPage = useCallback(async (doc: any, page: number, scaleVal: number) => {
    if (!canvasRef.current || !doc) return;
    if (renderTaskRef.current) {
      try { renderTaskRef.current.cancel(); } catch {}
    }
    try {
      const pdfPage = await doc.getPage(page);
      const viewport = pdfPage.getViewport({ scale: scaleVal });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      const task = pdfPage.render({ canvasContext: ctx, viewport });
      renderTaskRef.current = task;
      await task.promise;
      setIsLoading(false);
    } catch (e: any) {
      if (e?.name !== 'RenderingCancelledException') console.error(e);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setPageNumber(1);
      setPageInput('1');

      // webpackIgnore keeps webpack from bundling these — loaded as plain static files
      const pdfjsLib = await import(/* webpackIgnore: true */ '/pdf.min.mjs' as any);
      if (cancelled) return;

      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      const doc = await pdfjsLib.getDocument(url).promise;
      if (cancelled) return;

      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
      renderPage(doc, 1, scale);
    };
    load().catch(console.error);
    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    if (pdfDocRef.current) renderPage(pdfDocRef.current, pageNumber, scale);
  }, [pageNumber, scale]);

  const goToPrev = () => {
    const next = Math.max(1, pageNumber - 1);
    setPageNumber(next);
    setPageInput(String(next));
  };

  const goToNext = () => {
    const next = Math.min(numPages, pageNumber + 1);
    setPageNumber(next);
    setPageInput(String(next));
  };

  const zoomOut = () => setScale((s) => Math.max(0.5, parseFloat((s - 0.2).toFixed(1))));
  const zoomIn  = () => setScale((s) => Math.min(3.0, parseFloat((s + 0.2).toFixed(1))));

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputCommit = () => {
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      setPageNumber(val);
    } else {
      setPageInput(String(pageNumber));
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={goToPrev}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex items-center gap-1 text-xs text-gray-600">
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputCommit}
              onKeyDown={(e) => e.key === 'Enter' && handlePageInputCommit()}
              className="w-9 text-center border border-gray-200 rounded-md py-0.5 text-xs focus:outline-none focus:border-pink-300"
            />
            <span className="text-gray-400">/</span>
            <span className="tabular-nums">{numPages || '—'}</span>
          </div>

          <button
            onClick={goToNext}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          <span className="text-xs text-gray-600 w-10 text-center tabular-nums">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="relative flex-1 overflow-auto bg-gray-100 flex justify-center py-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="w-7 h-7 border-2 border-pink-300 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} className="shadow-md self-start" />
      </div>
    </div>
  );
}
