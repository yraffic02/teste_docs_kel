const { createWorker } = require("tesseract.js");
const BaseOcrProvider = require("./BaseOcrProvider");

class TesseractProvider extends BaseOcrProvider {
  constructor(lang = "por") {
    super();
    this.lang = lang;
  }

  async extractImage(imagePath) {
    const worker = await createWorker(this.lang);
    try {
      const { data } = await worker.recognize(imagePath);
      return data.text;
    } finally {
      await worker.terminate();
    }
  }
}

module.exports = TesseractProvider;
