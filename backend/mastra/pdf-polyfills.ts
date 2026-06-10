/**
 * Minimal DOMMatrix polyfill for pdfjs-dist running in Node.js / Vercel Edge.
 * pdfjs uses DOMMatrix to compute page viewports; this stub prevents the
 * "DOMMatrix is not defined" crash in SSR / API route contexts.
 * Must be called BEFORE any dynamic `import("pdf-parse")` / pdfjs import.
 */
export function applyPdfJsPolyfills() {
  if (typeof globalThis.DOMMatrix !== 'undefined') return;

  class MinimalDOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    is2D = true;
    isIdentity = true;

    constructor(_init?: string | number[]) {}
    invertSelf() { return this; }
    multiplySelf() { return this; }
    preMultiplySelf() { return this; }
    translateSelf() { return this; }
    scaleSelf() { return this; }
    scale3dSelf() { return this; }
    rotateSelf() { return this; }
    rotateFromVectorSelf() { return this; }
    rotateAxisAngleSelf() { return this; }
    skewXSelf() { return this; }
    skewYSelf() { return this; }
    setMatrixValue() { return this; }
    scale() { return new MinimalDOMMatrix(); }
    translate() { return new MinimalDOMMatrix(); }
    rotate() { return new MinimalDOMMatrix(); }
    flipX() { return new MinimalDOMMatrix(); }
    flipY() { return new MinimalDOMMatrix(); }
    multiply() { return new MinimalDOMMatrix(); }
    inverse() { return new MinimalDOMMatrix(); }
    transformPoint(p: DOMPointInit) { return { x: p.x ?? 0, y: p.y ?? 0, z: p.z ?? 0, w: p.w ?? 1 }; }
    toFloat32Array() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
    toFloat64Array() { return new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
    toJSON() { return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0, m11: 1, m12: 0, m13: 0, m14: 0, m21: 0, m22: 1, m23: 0, m24: 0, m31: 0, m32: 0, m33: 1, m34: 0, m41: 0, m42: 0, m43: 0, m44: 1, is2D: true, isIdentity: true }; }
    toString() { return 'matrix(1, 0, 0, 1, 0, 0)'; }
    static fromMatrix() { return new MinimalDOMMatrix(); }
    static fromFloat32Array() { return new MinimalDOMMatrix(); }
    static fromFloat64Array() { return new MinimalDOMMatrix(); }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).DOMMatrix = MinimalDOMMatrix;
}
