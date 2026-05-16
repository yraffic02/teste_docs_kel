const { Router } = require("express");
const importController = require("../controllers/importController");
const { authenticate, authorize } = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const audit = require("../middlewares/audit");

const router = Router();

router.use(authenticate);

router.post(
  "/xlsx",
  authorize("operator", "admin"),
  upload.single("file"),
  audit("xlsx_import", "document"),
  importController.importXlsx
);

module.exports = router;
