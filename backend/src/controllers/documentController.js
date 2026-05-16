const { Document, ExtractedPattern, AuditLog } = require("../models");
const documentQueue = require("../queues/documentQueue");
const xlsxService = require("../services/xlsxService");

async function upload(req, res, next) {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const documents = [];

    for (const file of files) {
      const doc = await Document.create({
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_path: file.path,
        status: "pending",
        created_by: req.user.id,
      });

      await documentQueue.add({ documentId: doc.id });

      documents.push(doc);
    }

    await AuditLog.create({
      user_id: req.user.id,
      action: "upload",
      entity: "document",
      entity_id: documents[0].id,
    });

    res.status(201).json({ data: documents, count: documents.length });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {};
    if (status) where.status = status;

    const { rows, count } = await Document.findAndCountAll({
      where,
      limit: parseInt(limit, 10),
      offset,
      order: [["created_at", "DESC"]],
      attributes: { exclude: ["extracted_text"] },
    });

    res.json({ data: rows, total: count, page: parseInt(page, 10) });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        { association: "extracted_patterns" },
        { association: "xml_import" },
      ],
    });
    if (!document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }
    res.json(document);
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "processing", "completed", "failed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    document.status = status;
    if (status === "completed" || status === "failed") {
      document.processed_at = new Date();
    }
    await document.save();

    res.json(document);
  } catch (err) {
    next(err);
  }
}

async function correctPatterns(req, res, next) {
  try {
    const { patterns } = req.body;
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    await ExtractedPattern.destroy({ where: { document_id: document.id } });
    const created = [];
    if (Array.isArray(patterns)) {
      for (const p of patterns) {
        const pat = await ExtractedPattern.create({
          document_id: document.id,
          type: p.type,
          value: p.value,
        });
        created.push(pat);
      }
    }

    res.json({ document_id: document.id, patterns: created });
  } catch (err) {
    next(err);
  }
}

const MIME_LABEL = {
  "application/pdf": "PDF",
  "image/png": "PNG",
  "image/jpeg": "JPG",
  "application/xml": "XML",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
};

function docToXlsxRow(doc, idx) {
  const patterns = doc.extracted_patterns || [];
  const findVal = (type) => {
    const p = patterns.find((x) => x.type === type);
    return p ? p.value : "";
  };

  return {
    id: idx + 1,
    arquivo_original: doc.original_name,
    tipo_arquivo: MIME_LABEL[doc.mime_type] || doc.mime_type,
    texto_extraido: doc.extracted_text ? doc.extracted_text.slice(0, 500) : "",
    cpf_identificado: findVal("cpf"),
    valor_identificado: findVal("currency") || findVal("value") || findVal("total_value"),
    data_identificada: findVal("date"),
    status: doc.status === "completed" ? "PROCESSADO" : doc.status.toUpperCase(),
    timestamp: doc.processed_at ? new Date(doc.processed_at).toISOString() : "",
  };
}

async function exportXlsx(req, res, next) {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [{ association: "extracted_patterns" }],
    });
    if (!document) {
      return res.status(404).json({ error: "Documento n\u00e3o encontrado" });
    }

    const rows = [docToXlsxRow(document, 0)];
    const buffer = xlsxService.generateReport(rows, "Registros");

    const name = document.original_name.replace(/\.[^.]+$/, "") + "_extraidos.xlsx";
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function exportAllXlsx(req, res, next) {
  try {
    const docs = await Document.findAll({
      include: [{ association: "extracted_patterns" }],
      order: [["created_at", "DESC"]],
    });

    const rows = docs.map(docToXlsxRow);
    const buffer = xlsxService.generateReport(rows, "Registros");

    const name = "exportacao_completa.xlsx";
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = { upload, list, getById, updateStatus, correctPatterns, exportXlsx, exportAllXlsx };
