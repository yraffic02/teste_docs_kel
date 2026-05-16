const { Router } = require("express");
const xmlController = require("../controllers/xmlController");
const { authenticate, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const audit = require("../middlewares/audit");

const router = Router();

router.use(authenticate);

router.post(
  "/upload",
  authorize("operator", "admin"),
  upload.single("xml"),
  audit("xml_upload", "xml_import"),
  xmlController.uploadXml
);

router.get(
  "/:documentId",
  authorize("operator", "manager", "admin"),
  xmlController.getByDocument
);

module.exports = router;
