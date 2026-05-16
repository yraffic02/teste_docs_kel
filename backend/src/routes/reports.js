const { Router } = require("express");
const reportController = require("../controllers/reportController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = Router();

router.use(authenticate, authorize("manager", "admin"));

router.get("/by-period", reportController.byPeriod);
router.get("/by-status", reportController.byStatus);
router.get("/by-mime-type", reportController.byMimeType);
router.get("/patterns", reportController.patterns);

module.exports = router;
