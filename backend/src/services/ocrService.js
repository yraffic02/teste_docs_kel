const { createWorker } = require("tesseract.js");
const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const crypto = require("crypto");
const logger = require("../shared/logger");
const { extractPatterns } = require("../shared/patterns");

async function extractText(filePath, mimeType) {
  if (mimeType === "application/pdf") {
    return extractPdfText(filePath);
  }
  if (mimeType === "image/png" || mimeType === "image/jpeg") {
    return extractImageText(filePath);
  }
  throw new Error(`Mime type não suportado: ${mimeType}`);
}

const pdfJsDistPath = path.dirname(require.resolve("pdfjs-dist/package.json"));
const standardFontDataUrl = "file://" + path.join(pdfJsDistPath, "standard_fonts") + "/";
const PDFJS = require("pdfjs-dist/legacy/build/pdf.mjs");

async function extractPdfText(filePath) {
  const buf = await fs.readFile(filePath);
  const data = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  const doc = await PDFJS.getDocument({ data, standardFontDataUrl }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
  }

  const cleaned = text.replace(/\s+/g, " ").trim();

  if (cleaned.length > 20) {
    return cleaned;
  }

  logger.info("PDF has no extractable text, falling back to OCR via pdftoppm", {
    filePath,
    pages: doc.numPages,
  });

  return extractPdfViaOcr(filePath);
}

async function extractPdfViaOcr(filePath) {
  const tmpDir = path.join(os.tmpdir(), crypto.randomUUID());
  await fs.mkdir(tmpDir, { recursive: true });

  try {
    execSync(`pdftoppm -png "${filePath}" "${tmpDir}/page"`, {
      stdio: "pipe",
      timeout: 120000,
    });

    const files = await fs.readdir(tmpDir);
    const pageFiles = files
      .filter((f) => f.endsWith(".png"))
      .sort()
      .map((f) => path.join(tmpDir, f));

    if (pageFiles.length === 0) {
      throw new Error("pdftoppm did not produce any page images");
    }

    const worker = await createWorker("por");
    try {
      let fullText = "";
      for (const pageFile of pageFiles) {
        const { data } = await worker.recognize(pageFile);
        fullText += data.text + "\n";
      }
      return fullText.trim();
    } finally {
      await worker.terminate();
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function extractImageText(filePath) {
  const worker = await createWorker("por");
  try {
    const { data } = await worker.recognize(filePath);
    return data.text;
  } finally {
    await worker.terminate();
  }
}

async function processDocument(document, fullPath) {
  logger.info("Processing document", { id: document.id, mime: document.mime_type });

  const text = await extractText(fullPath, document.mime_type);
  const patterns = extractPatterns(text);

  return { text, patterns };
}

module.exports = { extractText, extractPdfText, extractImageText, processDocument };
