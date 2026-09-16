import { getLanguageByCode } from './languages';

export interface TranslationProgressCallback {
  (percentage: number, stage: string, currentSnippet: string): void;
}

async function translateTextRemote(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const src = sourceLang === 'auto' ? 'auto' : sourceLang;

  // Existing primary translation endpoint.
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(gtxUrl, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translatedSegments = data[0]
          .map((segment: unknown) => Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : '')
          .filter(Boolean);
        const translatedString = translatedSegments.join('');
        if (translatedString && translatedString.trim().length > 0) {
          return translatedString;
        }
      }
    }
  } catch {
    // Failover to secondary engine
  }

  // 2. Secondary Failover: MyMemory Translation API
  try {
    if (src === 'auto' || new TextEncoder().encode(trimmed).length > 450) return null;
    const srcPair = src;
    const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      trimmed
    )}&langpair=${srcPair}|${targetLang}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(myMemoryUrl, { signal: controller.signal }).finally(() => clearTimeout(timeoutId));

    if (res.ok) {
      const data = await res.json();
      if (data && Number(data.responseStatus) === 200 && data.responseData && data.responseData.translatedText) {
        const translated = data.responseData.translatedText;
        if (!translated.includes('MYMEMORY WARNING') && !translated.includes('QUERY LENGTH LIMIT EXCEEDED')) {
          return translated;
        }
      }
    }
  } catch {
    // Caller reports failure rather than substituting untranslated text.
  }

  return null;
}

/** Keep complete paragraphs together, splitting only at word boundaries. */
export function translationChunks(text: string, maxLength = 1200): string[] {
  const chunks: string[] = [];
  for (const paragraph of text.split(/\n\s*\n/)) {
    let chunk = '';
    for (const word of paragraph.trim().split(/\s+/).filter(Boolean)) {
      if (chunk && chunk.length + word.length + 1 > maxLength) {
        chunks.push(chunk);
        chunk = '';
      }
      chunk += (chunk ? ' ' : '') + word;
    }
    if (chunk) chunks.push(chunk);
  }
  return chunks;
}

export async function translatePdfContent(
  pagesText: string[],
  sourceLang: string,
  targetLang: string,
  onProgress?: TranslationProgressCallback
): Promise<{ fullText: string; translatedPages: string[] }> {
  const totalPages = pagesText.length;
  const translatedPages: string[] = [];

  for (let i = 0; i < totalPages; i++) {
    const pageContent = pagesText[i];
    const pageNum = i + 1;

    if (onProgress) {
      const percent = Math.round(((i * 3 + 1) / (totalPages * 3)) * 80);
      onProgress(
        percent,
        `Processing & Normalizing Page ${pageNum} of ${totalPages}`,
        pageContent.slice(0, 60) + '...'
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Split into sentences / logical paragraphs for maximum neural translation quality
    const rawParagraphs = translationChunks(pageContent);
    const translatedParagraphs: string[] = [];

    for (let j = 0; j < rawParagraphs.length; j++) {
      const para = rawParagraphs[j];

      if (onProgress) {
        const linePercent = Math.round(
          ((i * 3 + 1.5 + (j / Math.max(rawParagraphs.length, 1))) / (totalPages * 3)) * 80
        );
        onProgress(
          Math.min(linePercent, 84),
          `Translating to ${getLanguageByCode(targetLang).name}`,
          para.slice(0, 50)
        );
      }

      const translated = sourceLang === targetLang ? para : await translateTextRemote(para, sourceLang, targetLang);
      if (!translated) {
        throw new Error(`Translation failed on page ${pageNum}. Please retry. No partial or dictionary-based translation has been substituted.`);
      }
      translatedParagraphs.push(translated);
    }

    const pageResult = translatedParagraphs.join('\n\n');
    translatedPages.push(pageResult);

    if (onProgress) {
      const percent = Math.round(((i + 1) / totalPages) * 88);
      onProgress(percent, `Completed Page ${pageNum} translation`, pageResult.slice(0, 60) + '...');
    }
  }

  const fullText = translatedPages
    .map((p, idx) => `[Page ${idx + 1}]\n${p}`)
    .join('\n\n');

  if (onProgress) {
    onProgress(92, 'Finalizing translated document structure...', 'Compiling translated PDF layout...');
  }
  await new Promise((resolve) => setTimeout(resolve, 300));

  return { fullText, translatedPages };
}
