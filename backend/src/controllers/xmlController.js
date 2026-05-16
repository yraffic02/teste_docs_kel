const { XmlImport, Document } = require("../models");
const fs = require("fs/promises");

async function uploadXml(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo XML enviado" });
    }

    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ error: "documentId é obrigatório" });
    }

    const document = await Document.findByPk(documentId);
    if (!document) {
      return res.status(404).json({ error: "Documento não encontrado" });
    }

    const xmlContent = await fs.readFile(req.file.path, "utf-8");

    const xmlImport = await XmlImport.create({
      document_id: documentId,
      xml_path: req.file.path,
      xml_content: xmlContent,
    });

    res.status(201).json(xmlImport);
  } catch (err) {
    next(err);
  }
}

async function getByDocument(req, res, next) {
  try {
    const xml = await XmlImport.findOne({
      where: { document_id: req.params.documentId },
    });
    if (!xml) {
      return res.status(404).json({ error: "XML não encontrado para este documento" });
    }
    res.json(xml);
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadXml, getByDocument };
