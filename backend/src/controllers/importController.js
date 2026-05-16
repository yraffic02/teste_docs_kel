const xlsxService = require("../services/xlsxService");
const { Document, ExtractedPattern } = require("../models");
const logger = require("../shared/logger");

async function importXlsx(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo XLSX enviado" });
    }

    const rows = xlsxService.parseImport(req.file.path);
    if (!rows || rows.length === 0) {
      return res.status(422).json({ error: "Planilha vazia ou formato invalido" });
    }

    const results = { imported: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const rowNum = i + 2;

        const nome = row["nome"] || row["Nome"] || row["NOME"] || "";
        const cliente = row["cliente"] || row["Cliente"] || row["CLIENTE"] || "";
        const cpf = row["cpf"] || row["CPF"] || "";
        const cnpj = row["cnpj"] || row["CNPJ"] || "";
        const valor = row["valor"] || row["Valor"] || row["VALOR"] || "";
        const documento = row["documento"] || row["Documento"] || row["DOCUMENTO"] || "";
        const data = row["data"] || row["Data"] || row["DATA"] || "";

        const doc = await Document.create({
          original_name: documento || `import_linha_${rowNum}`,
          mime_type: "application/xlsx",
          file_path: req.file.path,
          status: "completed",
          extracted_text: JSON.stringify(row),
          created_by: req.user.id,
          processed_at: new Date(),
        });

        if (nome) {
          await ExtractedPattern.create({
            document_id: doc.id, type: "name", value: nome,
          });
        }
        if (cliente) {
          await ExtractedPattern.create({
            document_id: doc.id, type: "client", value: cliente,
          });
        }
        if (cpf) {
          await ExtractedPattern.create({
            document_id: doc.id, type: "cpf", value: cpf,
          });
        }
        if (cnpj) {
          await ExtractedPattern.create({
            document_id: doc.id, type: "cnpj", value: cnpj,
          });
        }
        if (valor) {
          await ExtractedPattern.create({
            document_id: doc.id, type: "value", value: String(valor),
          });
        }
        if (data) {
          await ExtractedPattern.create({
            document_id: doc.id, type: "date", value: String(data),
          });
        }

        results.imported++;
      } catch (err) {
        results.errors.push({ row: i + 2, error: err.message });
        logger.error("XLSX import row error", { row: i + 2, error: err.message });
      }
    }

    res.status(201).json(results);
  } catch (err) {
    next(err);
  }
}

module.exports = { importXlsx };
