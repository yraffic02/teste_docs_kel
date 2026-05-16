class BaseOcrProvider {
  async extractImage(imagePath) {
    throw new Error("extractImage() must be implemented by subclass");
  }
}

module.exports = BaseOcrProvider;
