/**
 * Generates test PDFs and PNGs with structured data for extraction validation.
 *
 * Usage: node tests/generate-fixtures.js
 *
 * Dependencies: pdfkit (for PDF generation), canvas (for PNG generation)
 * Install: npm install --save-dev pdfkit canvas
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const FIXTURES_DIR = path.join(__dirname, "fixtures");
fs.mkdirSync(FIXTURES_DIR, { recursive: true });

const DOCUMENTS = [
  {
    filename: "contrato.pdf",
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS

Contratante: Maria Oliveira - CPF: 529.982.247-25
Contratada: Tech Solutions Ltda - CNPJ: 39.958.923/0001-60

Valor do contrato: R$ 15.000,00
Data de assinatura: 15/03/2024
Vigência: até 31/12/2026

Assinado digitalmente em São Paulo, 15 de março de 2024.`,
  },
  {
    filename: "nota-fiscal.pdf",
    content: `NOTA FISCAL DE SERVIÇOS - NF-2024-4582

Emitente: Fornecedora ABC S.A. - CNPJ: 11.222.333/0001-81
Tomador: João Silva - CPF: 123.456.789-09

Serviço de consultoria .......... R$ 4.500,00
Licenciamento de software ...... R$ 12.300,00

Total: R$ 16.800,00
Emissão: 10/01/2024`,
  },
  {
    filename: "documento.png",
    content: `FICHA CADASTRAL

Nome: Pedro Santos
CPF: 987.654.321-00
Data de nascimento: 20/05/1990

Documento emitido em 01/01/2024
Validade: 31/12/2030`,
  },
];

async function generatePDF(filename, textContent) {
  try {
    const PDFDocument = require("pdfkit");
    const doc = new PDFDocument();
    const filePath = path.join(FIXTURES_DIR, filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(12).text(textContent, 50, 50);
    doc.end();
    await new Promise((resolve) => stream.on("finish", resolve));
    console.log(`Generated: ${filename} (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn(`Could not generate ${filename}: ${err.message}. Install pdfkit: npm install --save-dev pdfkit`);
  }
}

async function generatePNG(filename, textContent) {
  try {
    const { createCanvas } = require("canvas");
    const lines = textContent.split("\n");
    const lineHeight = 20;
    const width = 600;
    const height = Math.max(400, lines.length * lineHeight + 80);
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#000000";
    ctx.font = "14px monospace";

    lines.forEach((line, i) => {
      ctx.fillText(line, 30, 50 + i * lineHeight);
    });

    const buffer = canvas.toBuffer("image/png");
    const filePath = path.join(FIXTURES_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`Generated: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.warn(`Could not generate ${filename}: ${err.message}. Install canvas: npm install --save-dev canvas`);
  }
}

(async () => {
  console.log("Generating test fixtures...\n");
  for (const doc of DOCUMENTS) {
    if (doc.filename.endsWith(".pdf")) {
      await generatePDF(doc.filename, doc.content);
    } else if (doc.filename.endsWith(".png")) {
      await generatePNG(doc.filename, doc.content);
    }
  }
  console.log("\nDone. Install optional dev deps to regenerate: npm install --save-dev pdfkit canvas");
})();
