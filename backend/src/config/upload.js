const path = require("path");

module.exports = {
  uploadDir: path.resolve(process.env.UPLOAD_DIR || "./uploads"),
  maxFileSize: 20 * 1024 * 1024,
  allowedMimes: {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    xml: "application/xml",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
};
