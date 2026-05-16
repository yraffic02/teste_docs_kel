const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/auth");
const { User } = require("../models");

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, jwtSecret);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso não autorizado" });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
