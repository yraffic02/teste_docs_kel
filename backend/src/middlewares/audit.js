const { AuditLog } = require("../models");

function audit(action, entity) {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400 && req.user) {
        try {
          await AuditLog.create({
            user_id: req.user.id,
            action,
            entity,
            entity_id: req.params.id || res.locals.entityId,
          });
        } catch (err) {
          console.error("Audit log failed:", err.message);
        }
      }
    });
    next();
  };
}

module.exports = audit;
