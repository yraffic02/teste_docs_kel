const { AuditLog, User } = require("../models");

async function list(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const { rows, count } = await AuditLog.findAndCountAll({
      include: [{ model: User, attributes: ["name", "email"], as: "user" }],
      limit: parseInt(limit, 10),
      offset,
      order: [["created_at", "DESC"]],
    });

    res.json({ data: rows, total: count, page: parseInt(page, 10) });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
