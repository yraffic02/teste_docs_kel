const { Router } = require("express");
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/auth");
const audit = require("../middlewares/audit");

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", userController.list);
router.post("/", audit("create_user", "user"), userController.create);
router.delete("/:id", audit("delete_user", "user"), userController.remove);

module.exports = router;
