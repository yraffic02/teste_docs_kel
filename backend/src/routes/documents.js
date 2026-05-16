const { Router } = require("express");
const documentController = require("../controllers/documentController");
const { authenticate, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const audit = require("../middlewares/audit");

const router = Router();

router.use(authenticate);

router.post(
  "/upload",
  authorize("operator", "admin"),
  upload.array("files", 10),
  documentController.upload
);

router.get(
  "/",
  authorize("operator", "manager", "admin"),
  documentController.list
);

router.get(
  "/export/all",
  authorize("operator", "manager", "admin"),
  documentController.exportAllXlsx
);

router.get(
  "/:id",
  authorize("operator", "manager", "admin"),
  documentController.getById
);

router.get(
  "/:id/export",
  authorize("operator", "manager", "admin"),
  documentController.exportXlsx
);

router.patch(
  "/:id/status",
  authorize("operator", "admin"),
  documentController.updateStatus
);

router.put(
  "/:id/patterns",
  authorize("operator", "admin"),
  audit("correct_patterns", "document"),
  documentController.correctPatterns
);

module.exports = router;
