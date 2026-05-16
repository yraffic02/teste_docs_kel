const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const uploadConfig = require("../config/upload");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = Object.values(uploadConfig.allowedMimes);
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: uploadConfig.maxFileSize },
});

module.exports = upload;
