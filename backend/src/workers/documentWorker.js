const documentQueue = require("../queues/documentQueue");
const { createDefaultOcrService } = require("../services/ocr/OcrService");
const { Document, ExtractedPattern } = require("../models");
const logger = require("../shared/logger");

const ocrService = createDefaultOcrService();

documentQueue.process(async (job) => {
  const { documentId } = job.data;
  logger.info("Worker processing job", { documentId, attempt: job.attemptsMade + 1 });

  const document = await Document.findByPk(documentId);
  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  await document.update({ status: "processing" });

  try {
    const { text, patterns } = await ocrService.processDocument(
      document,
      document.file_path
    );

    document.extracted_text = text;
    document.status = "completed";
    document.processed_at = new Date();
    await document.save();

    for (const p of patterns) {
      await ExtractedPattern.create({
        document_id: document.id,
        type: p.type,
        value: p.value,
      });
    }

    logger.info("Document processed successfully", {
      documentId,
      patternsFound: patterns.length,
    });
  } catch (err) {
    await document.update({ status: "failed" });
    logger.error("Document processing failed", {
      documentId,
      error: err.message,
    });
    throw err;
  }
});

module.exports = documentQueue;
