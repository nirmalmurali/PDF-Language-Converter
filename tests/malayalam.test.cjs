const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
require.extensions['.ts'] = (mod, filename) => {
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, filename);
};
const { repairMalayalamText, extractLogicalText } = require('../src/lib/pdfParser.ts');
const { translationChunks, translatePdfContent } = require('../src/lib/translator.ts');

test('preserves letters, real spaces, chillu and logical vowel order', () => {
  for (const text of ['മലയാളം ഒരു ഭാഷയാണ്', 'കേരളം മനോഹരമാണ്', 'അവൻ ഇന്ന് വരും', 'കേട്ടു', 'അത് നല്ലതാണ്', 'മലയാളം\nകേരളം']) {
    assert.equal(repairMalayalamText(text), text.normalize('NFC'));
  }
});
test('keeps joiners and combines split text runs without deleting letters', () => {
  assert.equal(repairMalayalamText('ന്\u200d'), 'ന്\u200d');
  assert.equal(extractLogicalText([{str:'ക'}, {str:'േരളം'}, {str:' '}, {str:'മനോഹരമാണ്',hasEOL:true}, {str:'മലയാളം'}]), 'കേരളം മനോഹരമാണ്\nമലയാളം');
});
test('NFC composes canonical vowel sequences without visual reordering', () => {
  assert.equal(repairMalayalamText('ക\u0D46\u0D3E'), 'കൊ');
});
test('translation keeps line-wrapped sentence context and all words', () => {
  assert.deepEqual(translationChunks('കേരളം\nമനോഹരമാണ്.\n\nമലയാളം ഒരു ഭാഷയാണ്.'), ['കേരളം മനോഹരമാണ്.', 'മലയാളം ഒരു ഭാഷയാണ്.']);
  const text = 'കേരളം മനോഹരമാണ് '.repeat(300).trim();
  assert.equal(translationChunks(text).join(' '), text);
});
test('service failure is surfaced instead of dictionary substitution', async () => {
  const original = global.fetch;
  global.fetch = async () => { throw new Error('offline'); };
  try {
    await assert.rejects(translatePdfContent(['മലയാളം'], 'ml', 'en'), /Translation failed/);
  } finally { global.fetch = original; }
});
test('fallback never sends a truncated long paragraph', async () => {
  const original = global.fetch;
  const urls = [];
  global.fetch = async url => { urls.push(url); return {ok:false}; };
  try {
    await assert.rejects(translatePdfContent(['മലയാളം '.repeat(100)], 'ml', 'en'));
    assert.equal(urls.length, 1);
    assert.ok(urls[0].includes('translate.googleapis.com'));
  } finally { global.fetch = original; }
});

const { wrapPdfText } = require('../src/lib/pdfGenerator.ts');
test('PDF wrapping retains Malayalam conjuncts and every character', () => {
  const segmenter = new Intl.Segmenter('ml', {granularity:'grapheme'});
  const width = text => Array.from(segmenter.segment(text)).length;
  const text = 'ക്ഷേ'.repeat(20);
  const lines = wrapPdfText(text, 4, width);
  assert.equal(lines.join(''), text);
  assert.ok(lines.every(line => width(line) <= 4));
  assert.deepEqual(wrapPdfText('മലയാളം\n\nകേരളം', 100, width), ['മലയാളം', '', 'കേരളം']);
});
