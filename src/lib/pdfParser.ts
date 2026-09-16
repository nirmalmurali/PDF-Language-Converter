import type { Worker } from 'tesseract.js';

export interface ParsedPdf {
  text: string;
  pagesText: string[];
  pageCount: number;
  warnings: string[];
  metadata?: { title?: string; author?: string; creationDate?: string };
}
export interface ParseOptions {
  forceMalayalamOcr?: boolean;
  onProgress?: (message: string) => void;
}

/** Preserve word boundaries and Unicode logical order. Never guess missing letters. */
export function repairMalayalamText(text: string): string {
  return text.normalize('NFC').replace(/\r\n?/g, '\n')
    .replace(/[\t ]+/g, ' ').trim();
}

export interface TextRun { str: string; hasEOL?: boolean }
export function extractLogicalText(items: TextRun[]): string {
  // PDF.js already supplies logical Unicode strings and synthesized word spaces.
  // Sorting glyphs by their visual x position corrupts Indic combining sequences.
  return repairMalayalamText(items.map(item => item.str + (item.hasEOL ? '\n' : '')).join(''));
}

export async function parsePdfFile(file: File, options: ParseOptions = {}): Promise<ParsedPdf> {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) });
  let worker: Worker | undefined;
  try {
    const doc = await task.promise;
    const pagesText: string[] = [];
    const warnings: string[] = [];
    for (let n = 1; n <= doc.numPages; n++) {
      options.onProgress?.(`Reading page ${n} of ${doc.numPages}…`);
      const page = await doc.getPage(n);
      try {
        const content = await page.getTextContent();
        const embedded = extractLogicalText(content.items.filter((item): item is typeof item & TextRun => 'str' in item));
        const needsOcr = options.forceMalayalamOcr || /[\u0D00-\u0D7F\uFFFD\uE000-\uF8FF]/u.test(embedded) || !embedded.trim();
        if (!needsOcr) {
          pagesText.push(embedded);
          continue;
        }
        options.onProgress?.(`Reading page ${n} of ${doc.numPages} with Malayalam + English OCR…`);
        if (!worker) {
          const { createWorker, PSM } = await import('tesseract.js');
          worker = await createWorker(['mal', 'eng']);
          await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO, preserve_interword_spaces: '0' });
        }
        // Render near 300 DPI; cap memory for unusually large pages.
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(300 / 72, Math.sqrt(16_000_000 / (base.width * base.height)), 8192 / Math.max(base.width, base.height));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        try {
          await page.render({ canvas, viewport, background: '#ffffff' }).promise;
          const { data } = await worker.recognize(canvas);
          const text = repairMalayalamText(data.text);
          if (!text) {
            warnings.push(`Page ${n}: OCR found no text. Check whether this page is blank or unreadable.`);
          } else if (data.confidence < 80) {
            warnings.push(`Page ${n}: OCR confidence is ${Math.round(data.confidence)}%. Review and correct the text before translating.`);
          }
          pagesText.push(text);
        } finally {
          canvas.width = canvas.height = 0;
        }
      } finally {
        page.cleanup();
      }
    }
    if (!pagesText.some(text => text.trim())) throw new Error('No readable text found. Try a clearer PDF or scan.');
    return {
      text: pagesText.map((text, i) => `[Page ${i + 1}]\n${text}`).join('\n\n'),
      pagesText, pageCount: doc.numPages, warnings,
    };
  } finally {
    await Promise.allSettled([worker?.terminate(), task.destroy()]);
  }
}
