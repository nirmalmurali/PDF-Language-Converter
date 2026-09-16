This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Malayalam extraction

Malayalam text is no longer repaired by deleting spaces, moving vowel signs,
joining arbitrary consonants, or replacing ligatures. Native text uses PDF.js
logical item order followed by NFC normalization. Malayalam pages, empty text
layers, replacement characters and private-use font mappings trigger rendered
page OCR using Tesseract.js with `mal` + `eng` models. Rendering targets 300 DPI
with a 16-million-pixel memory cap. A manual Malayalam OCR retry covers legacy
fonts whose extracted text looks like Latin characters.

OCR runs in the browser; the first run downloads OCR runtime/language data from
the library's default CDNs. PDF.js also downloads its version-matched worker.
The existing translation endpoints still receive extracted text for translation.
OCR is not guaranteed to recover every glyph, especially in blurry scans,
complex layouts or unusual fonts. Scanned languages other than Malayalam and
English need additional OCR models. A confidence score is a heuristic, not a
measured percentage of correct words.

Review and optionally edit each page, then check the review box before converting.
Warnings identify empty OCR pages and confidence below 80. Translation preserves
line-wrapped paragraph context. Provider failure now stops conversion rather than
silently returning dictionary substitutions or truncating fallback input.

Validation: `node --test tests/malayalam.test.cjs` and `npx tsc --noEmit`.
The regression suite covers Unicode preservation, item assembly, paragraph chunks,
service failure and prevention of truncated fallback requests. OCR accuracy still
requires testing with representative source PDFs and human-verified Malayalam
transcriptions; no source PDF was supplied with the reported screenshot.

## Malayalam PDF download

PDF export now waits for the bundled Noto Sans Malayalam font (SIL OFL license in
`public/fonts`) and uses browser text shaping for complete lines. A4 pages are
stored as lossless PNG images at approximately 288 DPI so Malayalam conjuncts and
vowels render independently of PDF viewer fonts. These downloads are image-based,
not searchable/selectable text; use the app's Copy Text action for Unicode text.
Wrapping uses measured shaped widths and grapheme boundaries, including long words.
Continuation pages have correct total page numbers. Font load failures stop export
with an error instead of creating a corrupt file. No new server dependency is needed.
