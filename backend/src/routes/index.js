const { Router } = require("express");
const authRoutes = require("./auth");
const documentRoutes = require("./documents");
const xmlRoutes = require("./xml");
const reportRoutes = require("./reports");
const userRoutes = require("./users");
const auditRoutes = require("./audit");
const importRoutes = require("./imports");

const router = Router();

router.use("/auth", authRoutes);
router.use("/documents", documentRoutes);
router.use("/xml", xmlRoutes);
router.use("/reports", reportRoutes);
router.use("/users", userRoutes);
router.use("/audit", auditRoutes);
router.use("/import", importRoutes);

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

module.exports = router;
