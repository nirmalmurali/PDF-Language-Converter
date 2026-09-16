import { jsPDF } from 'jspdf';
import { getLanguageByCode } from './languages';

export interface PdfGenerationOptions {
  translatedPages: string[];
  sourceLang: string;
  targetLang: string;
  originalFileName: string;
}

const FONT = 'PdfMalayalam';
let fontReady: Promise<void> | undefined;
async function loadMalayalamFont(): Promise<void> {
  if (!fontReady) {
    fontReady = (async () => {
      const face = new FontFace(FONT, 'url(/fonts/NotoSansMalayalam.ttf)', { weight: '100 900' });
      await face.load();
      document.fonts.add(face);
    })().catch(() => {
      fontReady = undefined;
      throw new Error('The Malayalam PDF font could not be loaded. Please reload the app and retry.');
    });
  }
  return fontReady;
}

/** Wrap using the same shaping engine used to draw; never split a combining cluster. */
export function wrapPdfText(text: string, maxWidth: number, measure: (text: string) => number): string[] {
  const lines: string[] = [];
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
    let line = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (measure(candidate) <= maxWidth) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      if (measure(word) <= maxWidth) { line = word; continue; }
      for (const { segment } of segmenter.segment(word)) {
        if (line && measure(line + segment) > maxWidth) { lines.push(line); line = ''; }
        line += segment;
      }
    }
    lines.push(line);
  }
  return lines;
}

/**
 * Browser text shaping handles Malayalam GSUB/GPOS and conjuncts. Store the shaped
 * pages as high-resolution images: jsPDF's standard text renderer is not an Indic
 * shaping engine. Copy Text in the UI remains available for the Unicode content.
 */
export async function generateTranslatedPdf({
  translatedPages, sourceLang, targetLang, originalFileName,
}: PdfGenerationOptions): Promise<{ blob: Blob; url: string; fileName: string }> {
  if (!translatedPages.some(page => page.trim())) throw new Error('There is no translated text to export.');
  if (targetLang === 'ml' || /[\u0D00-\u0D7F]/u.test(translatedPages.join('') + originalFileName)) {
    await loadMalayalamFont();
  }
  const baseName = originalFileName.replace(/\.pdf$/i, '');
  const width = 794;
  const height = 1123;
  const margin = 64;
  const bodyTop = 146;
  const bodyBottom = 1045;
  const lineHeight = 28;
  const scale = 3; // approximately 288 DPI at A4
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot render PDF pages.');
  ctx.scale(scale, scale);
  const family = `"${FONT}", Arial, sans-serif`;
  const bodyFont = `400 16px ${family}`;
  const titleFont = `600 14px ${family}`;
  const contentWidth = width - 2 * margin;
  type Sheet = { lines: string[]; sourcePage: number };
  const sheets: Sheet[] = [];
  try {
    ctx.font = titleFont;
    const titleLines = wrapPdfText(baseName, contentWidth, text => ctx.measureText(text).width);
    // Keep the document name in PDF metadata in full; header title is bounded.
    const title = titleLines.slice(0, 2);
    if (titleLines.length > 2) title[1] = title[1].replace(/.{0,3}$/u, '') + '…';
    ctx.font = bodyFont;
    const perPage = Math.floor((bodyBottom - bodyTop) / lineHeight);
    translatedPages.forEach((text, index) => {
      const lines = wrapPdfText(text, contentWidth, value => ctx.measureText(value).width);
      for (let offset = 0; offset < lines.length; offset += perPage) {
        sheets.push({ lines: lines.slice(offset, offset + perPage), sourcePage: index + 1 });
      }
    });
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    doc.setProperties({ title: baseName, subject: `Translation to ${getLanguageByCode(targetLang).name}`, creator: 'PDF Language Converter' });
    for (let index = 0; index < sheets.length; index++) {
      if (index) doc.addPage();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(0, 0, width, 44);
      ctx.font = '600 12px Arial, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`PDF LANGUAGE CONVERTER | ${getLanguageByCode(sourceLang).name} to ${getLanguageByCode(targetLang).name}`, margin, 28);
      ctx.font = titleFont;
      ctx.fillStyle = '#1e293b';
      title.forEach((line, i) => ctx.fillText(line, margin, 76 + i * 23));
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(margin, 118, contentWidth, 1);
      ctx.font = bodyFont;
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = ['ar', 'he', 'fa', 'ur'].includes(targetLang) ? 'right' : 'left';
      ctx.direction = ctx.textAlign === 'right' ? 'rtl' : 'ltr';
      sheets[index].lines.forEach((line, i) => ctx.fillText(line, ctx.textAlign === 'right' ? width - margin : margin, bodyTop + i * lineHeight));
      ctx.textAlign = 'left';
      ctx.direction = 'ltr';
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Source page ${sheets[index].sourcePage}`, margin, height - 36);
      ctx.textAlign = 'right';
      ctx.fillText(`Page ${index + 1} of ${sheets.length}`, width - margin, height - 36);
      ctx.textAlign = 'left';
      doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297, undefined, 'FAST');
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }
    const blob = doc.output('blob');
    return { blob, url: URL.createObjectURL(blob), fileName: `${baseName}_converted_${targetLang.toLowerCase()}.pdf` };
  } finally {
    canvas.width = canvas.height = 0;
  }
}
